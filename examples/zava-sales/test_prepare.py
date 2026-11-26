import unittest
from prepare import IDS, ORIGINS, bindings, render


def fixture():
    return {**{key: f"12345678-0000-4000-8000-{i:012x}" for i, key in enumerate(sorted(IDS), 1)},
            **{key: "https://" + key.split("_")[0].lower() + ".example.invalid" for key in ORIGINS},
            "APP_ROLE_IDS": ["12345678-0000-4000-8000-000000000010"]}


class BindingTests(unittest.TestCase):
    def test_render_only_approved_values(self):
        local = fixture()
        values = bindings(local)
        self.assertEqual(render("@@DATAVERSE_HOST@@", values), "dataverse.example.invalid")
        self.assertEqual(render("@@APP_ROLE_MAP@@", values), '<Role id="{' + local["APP_ROLE_IDS"][0] + '}" />')
        with self.assertRaisesRegex(ValueError, "Unknown template"):
            render("@@UNEXPECTED@@", values)

    def test_fail_closed_before_preparing_a_build(self):
        for override in ({"APP_ROLE_IDS": []}, {"PANE_CLIENT_ID": ""}, {"SHARED_CONNECTION": "not allowed"},
                         {"APP_ORIGIN": "https://*.example.invalid"}, {"APP_ORIGIN": "https://app.example.invalid;"},
                         {"APP_ORIGIN": "https://pane.example.invalid"}):
            with self.subTest(override=override), self.assertRaises(ValueError):
                bindings({**fixture(), **override})


if __name__ == "__main__":
    unittest.main()
