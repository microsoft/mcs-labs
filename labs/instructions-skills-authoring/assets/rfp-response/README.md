# RFP Response skill package

The classic and guided Instructions and Skills labs share one uploadable
[`rfp-response.zip`](../rfp-response.zip?raw=true). This directory holds its source,
adapted with permission from the [AgentDudeSamples RFP Skill](https://github.com/Dewain27/AgentDudeSamples/tree/7066035ce8f9b12329cb06c262f09413f7ea3e08/samples/RFP%20Skill).
The sample references and worked examples are unchanged. The bundled Python
checker produces the CSV review checklist. The agent uses its host to create the
PDF from the finished Markdown proposal; no PDF renderer is bundled.

After editing this source, run these commands from this directory. The archive
must have `SKILL.md` and the three package directories at its root.

```text
python -m zipfile -c ../rfp-response.zip SKILL.md assets references scripts
python -m zipfile -t ../rfp-response.zip
```
