// Copyright (c) Microsoft Corporation. Licensed under the MIT License; see LICENSE.txt.
// Adapts the native WebChat activity grouping from CopilotStudioSamples PR #544.
// Adapted for Zava: constructor parameter property replaced by a field (erasableSyntaxOnly).

import type { Activity } from '@microsoft/agents-activity';
import {
  CopilotStudioClient, CopilotStudioWebChat, type CopilotStudioWebChatConnection
} from '@microsoft/agents-copilotstudio-client';
import { Observable, ReplaySubject, share, Subscription } from 'rxjs';
import {
  type ActivityDetail, type ActivityVisibility, emptyActivityDetails, hasDetailEntities,
  isInformative, isToolEvent, record, streamMetadata, updateActivityDetails
} from './activityDetails';

interface Callbacks {
  onBusyChange: (busy: boolean) => void;
  onError: (error: Error) => void;
}

export class AgentActivityAdapter {
  private state = emptyActivityDetails();
  private turn = 0;
  private outcome: 'finished' | 'interrupted' | undefined;
  private sequenceIds = new Map<string, number>();
  private timestamp = new Date().toISOString();
  private author = { id: 'agent', role: 'bot' };
  private readonly visibility: ActivityVisibility;

  constructor(visibility: ActivityVisibility) {
    this.visibility = visibility;
  }

  startTurn(): void {
    this.state = emptyActivityDetails();
    this.sequenceIds.clear();
    this.timestamp = new Date().toISOString();
    this.outcome = undefined;
    this.turn++;
  }

  transform(activity: Partial<Activity>): Partial<Activity>[] {
    if (activity.type === 'event' && activity.name === 'turn.complete') return this.finishTurn();
    if (hasDetailEntities(activity) || isInformative(activity) || isToolEvent(activity)) {
      const previous = this.state;
      this.state = updateActivityDetails(previous, activity, this.visibility);
      if (typeof activity.from?.id === 'string') this.author = { id: activity.from.id, role: 'bot' };
      const updates = this.state.entries
        .filter(entry => previous.entries.find(candidate => candidate.id === entry.id) !== entry)
        .map(entry => {
          const sequenceId = record(activity.channelData)['webchat:sequence-id'];
          if (!this.sequenceIds.has(entry.id) && typeof sequenceId === 'number') {
            this.sequenceIds.set(entry.id, sequenceId);
          }
          return this.render(entry);
        });
      // A detail entity can share an activity with answer text or a card.
      if (activity.type === 'message' ||
          (activity.type === 'typing' && activity.text && streamMetadata(record(activity)).streamType === 'streaming')) {
        updates.push({
          ...activity,
          entities: activity.entities?.filter(entity => entity.type !== 'thought' && entity.type !== 'toolCall')
        });
      }
      return updates;
    }
    const nativeAnalysis = activity.entities?.some(entity =>
      entity.type === 'https://schema.org/Message' &&
      Array.isArray(entity.keywords) && entity.keywords.includes('AnalysisMessage'));
    return nativeAnalysis && !this.visibility.showReasoning ? [] : [activity];
  }

  finishTurn(interrupted = false): Partial<Activity>[] {
    if (this.outcome) return [];
    this.outcome = interrupted ? 'interrupted' : 'finished';
    return this.state.entries.map(entry => this.render(entry));
  }

  private render(entry: ActivityDetail): Partial<Activity> {
    const finished = entry.kind === 'tool' ? entry.status === 'finished' : this.outcome === 'finished';
    const failed = entry.status === 'failed';
    return {
      type: 'message',
      id: `activity:turn:${this.turn}:${entry.id}`,
      from: this.author,
      timestamp: this.timestamp,
      channelData: { 'webchat:sequence-id': this.sequenceIds.get(entry.id) },
      textFormat: 'plain',
      text: entry.kind === 'reasoning' ? entry.text
        : failed ? 'Failed' : finished ? 'Finished' : this.outcome ? 'No finish event received.' : 'Started',
      entities: [{
        type: 'https://schema.org/Message', '@context': 'https://schema.org', '@id': '', '@type': 'Message',
        abstract: entry.kind === 'reasoning' ? 'Reasoning' : entry.text,
        keywords: ['AnalysisMessage', 'Collapsible'],
        position: this.state.entries.indexOf(entry) + 1,
        creativeWorkStatus: failed ? 'Failed' : finished ? 'Published' : this.outcome ? undefined : 'Incomplete',
        isPartOf: {
          '@id': `activity:turn:${this.turn}`, '@type': 'HowTo',
          abstract: this.outcome === 'interrupted' ? 'Agent activity interrupted' : 'Agent activity',
          creativeWorkStatus: this.outcome === 'interrupted' ? 'Failed' : this.outcome === 'finished' ? 'Published' : 'Incomplete'
        }
      }]
    };
  }
}

export function createAgentActivityConnection(
  client: CopilotStudioClient, visibility: ActivityVisibility, callbacks: Callbacks
): CopilotStudioWebChatConnection {
  return wrapAgentActivityConnection(
    CopilotStudioWebChat.createConnection(client, { showTyping: true }), visibility, callbacks
  );
}

export function wrapAgentActivityConnection(
  connection: CopilotStudioWebChatConnection, visibility: ActivityVisibility, callbacks: Callbacks
): CopilotStudioWebChatConnection {
  const adapter = new AgentActivityAdapter(visibility);
  const requests = new Set<Subscription>();
  let ended = false;
  let sequence = 0;
  let emitUpdates: ((activities: Partial<Activity>[]) => void) | undefined;
  const report = (error: unknown): Error => {
    const failure = error instanceof Error ? error : new Error('The agent connection failed.');
    if (!ended) {
      emitUpdates?.(adapter.finishTurn(true));
      callbacks.onBusyChange(false);
      callbacks.onError(failure);
    }
    return failure;
  };
  const activity$ = new Observable<Partial<Activity>>(subscriber => {
    const emit = (activities: Partial<Activity>[]): void => {
      for (const activity of activities) {
        subscriber.next({ ...activity, id: activity.id || `agent-activity-${++sequence}` });
      }
    };
    emitUpdates = emit;
    const subscription = connection.activity$.subscribe({
      next: activity => { if (!ended) emit(adapter.transform(activity)); },
      error: error => {
        report(error);
        connection.connectionStatus$.next(4);
        subscriber.complete();
      },
      complete: () => subscriber.complete()
    });
    return () => {
      if (emitUpdates === emit) emitUpdates = undefined;
      subscription.unsubscribe();
    };
  }).pipe(share({
    // WebChat subscribes for connection setup and again for the transcript.
    connector: () => new ReplaySubject<Partial<Activity>>(),
    resetOnComplete: true, resetOnError: true, resetOnRefCountZero: true
  }));

  return {
    connectionStatus$: connection.connectionStatus$,
    get conversationId() { return connection.conversationId; },
    activity$,
    postActivity: activity => new Observable(subscriber => {
      if (ended || requests.size) {
        subscriber.error(new Error(ended ? 'The connection has ended.' : 'Wait for the current response.'));
        return;
      }
      let acknowledged = false;
      const subscription = new Subscription();
      const finish = (interrupted = false): void => {
        if (!requests.delete(subscription) || ended) return;
        if (activity.type === 'message') emitUpdates?.(adapter.finishTurn(interrupted));
        callbacks.onBusyChange(false);
      };
      try {
        requests.add(subscription);
        if (activity.type === 'message') adapter.startTurn();
        callbacks.onBusyChange(true);
        subscription.add(connection.postActivity(activity).subscribe({
          next: id => { acknowledged = true; subscriber.next(id); },
          error: error => { finish(true); subscriber.error(report(error)); },
          complete: () => { finish(); subscriber.complete(); }
        }));
      } catch (error) {
        finish(true);
        subscriber.error(report(error));
      }
      return () => {
        // WebChat stops listening after acknowledgement, before the response ends.
        if (!acknowledged) {
          subscription.unsubscribe();
          finish(true);
        }
      };
    }),
    end: () => {
      ended = true;
      requests.forEach(subscription => subscription.unsubscribe());
      requests.clear();
      connection.end();
    }
  };
}
