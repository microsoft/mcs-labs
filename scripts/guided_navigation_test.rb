# frozen_string_literal: true

require "minitest/autorun"
require "bundler/setup"
require "jekyll"

class GuidedNavigationTest < Minitest::Test
  def render(*types)
    site = Jekyll::Site.new(Jekyll.configuration("quiet" => true))
    missions = types.map.with_index(1) do |type, n|
      { "id" => "ex-#{n}", "title" => "Exercise #{n}", "optional" => type == :homework }
    end
    page = { "slug" => "fixture", "mission_lab" => { "missions" => missions } }
    Liquid::Template.parse("{% include lab-missions.html %}").render!(
      { "page" => page, "site" => site.site_payload["site"] }, registers: { site: site, page: page }
    )
  end

  def test_trailing_homework_uses_native_navigation_and_original_numbers
    html = render(:main, :main, :homework, :homework)
    %w[route rail].each do |nav|
      lists = html.scan(/<ol start="(\d+)" aria-labelledby="#{nav}-group-\d+">(.*?)<\/ol>/m)
      assert_equal [["1", %w[ex-1 ex-2]], ["3", %w[ex-3 ex-4]]],
                   lists.map { |start, links| [start, links.scan(/data-mission-link="([^"]+)"/).flatten] }
      assert_includes html, "id=\"#{nav}-group-3\">Homework (optional)</h2>"
    end
    assert_equal %w[ex-1 ex-2], html.scan(/data-progress-segment="([^"]+)"/).flatten
    assert_match(/id="ex-3-title"><span[^>]*>Homework \(optional\)<\/span> Exercise 3/, html)
    actions = html.scan(/<footer class="mission-actions">(.*?)<\/footer>/m).flatten
    assert_equal [1], actions.each_index.select { |index| actions[index].include?('id="lab-homework-stop"') }
    assert_match(/class="btn btn-primary" href="#lab-finish">Finish lab<\/a>/, actions[1])
    assert_match(/class="btn btn-ghost" href="#ex-3">Explore homework/, actions[1])
  end

  def test_no_premature_stop
    [[:main, :main], [:homework], [:main, :homework, :main]].each do |types|
      refute_includes render(*types), 'id="lab-homework-stop"'
    end
    html = render(:main, :homework, :main, :homework)
    actions = html.scan(/<footer class="mission-actions">(.*?)<\/footer>/m).flatten
    assert_includes actions.first, 'href="#ex-3">Skip optional exercises'
    assert_equal [2], actions.each_index.select { |index| actions[index].include?('id="lab-homework-stop"') }
  end
end
