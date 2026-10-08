"""Real NLP pipeline tests: ground candidate filtering, aliases and passages."""
import unittest
import spacy
from concepts import extract_concepts, select_concepts, concept_passage, clean_text


class ConceptTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nlp = spacy.load('en_core_web_sm')

    def extract(self, text):
        return extract_concepts(self.nlp(text))

    def test_proper_terms_phrases_and_aliases(self):
        terms = self.extract("pyvmomi supports VMware and OpenStack. Conway's Law informs software design. Developers write unit tests and unit testing improves software.")
        labels = {v['title'] for v in terms.values()}
        self.assertTrue({'pyVmomi', 'VMware', 'OpenStack', "Conway's Law", 'unit testing', 'software design'} <= labels, labels)
        self.assertNotIn('unit tests', labels)
        self.assertNotIn('Conway', labels)

    def test_variants_merge_and_generic_words_disappear(self):
        terms = self.extract('Tests guide testing. A test catches errors. Actually, things are going well this year.')
        self.assertIn('testing', terms)
        self.assertFalse({'test', 'tests', 'actually', 'thing', 'year', 'going'} & terms.keys())

    def test_frequency_is_distinct_articles_not_mentions(self):
        docs = [self.extract('pyVmomi. pyVmomi. pyVmomi.'), self.extract('pyvmomi integrates VMware.')]
        nodes = select_concepts(docs, ['pyVmomi', 'Integration'])
        node = next(n for n in nodes if n['title'] == 'pyVmomi')
        self.assertEqual(node['articles'], [0, 1])

    def test_technical_phrase_plurals_share_articles_and_evidence(self):
        texts = [
            'A Domain Specific Language can help developers.',
            'We build Domain Specific Languages in Grails.',
            'A domain-specific language and domain specific languages help developers.',
        ]
        docs = [self.extract(text) for text in texts]
        key = 'domain specific language'
        for terms in docs:
            self.assertIn(key, terms)
            self.assertNotIn('domain specific languages', terms)
        nodes = select_concepts(docs, texts)
        node = next(n for n in nodes if n['key'] == key)
        self.assertEqual(node['articles'], [0, 1, 2])
        mentions = [texts[2][a:b] for a, b in sorted(docs[2][key]['spans'])]
        self.assertEqual(mentions, ['domain-specific language', 'domain specific languages'])

    def test_plural_common_nouns_inside_named_phrases_use_lemmas(self):
        terms = self.extract('VMware administrators manage systems. A VMware administrator helps developers.')
        self.assertIn('vmware administrator', terms)
        self.assertNotIn('vmware administrators', terms)

    def test_protected_names_are_not_singularized(self):
        terms = self.extract('Grails supports applications. Rails supports applications. Siemens uses Kubernetes.')
        self.assertIn('Grails', {t['title'] for t in terms.values()})
        self.assertIn('Rails', {t['title'] for t in terms.values()})
        self.assertIn('Kubernetes', {t['title'] for t in terms.values()})
        self.assertIn('Siemens', {t['title'] for t in terms.values()})
        self.assertFalse({'grail', 'rail', 'kubernete', 'siemen'} & terms.keys())
        # An actual singular noun must still be distinct from the framework.
        self.assertIn('grail', self.extract('The knight searches for a grail.'))

    def test_unrelated_passages_do_not_pollute_concept_context(self):
        text = 'Gardening improves soil. ' * 50 + 'Unit testing catches bugs. ' + 'Astronomy explores stars. ' * 50
        terms = self.extract(text)
        passage = concept_passage(text, terms['unit testing']['spans'][0])
        self.assertIn('Unit testing', passage)
        self.assertLess(len(passage), 700)
        self.assertNotIn('Gardening improves soil. ' * 15, passage)

    def test_cleaning_drops_code_urls_but_keeps_link_labels(self):
        text = clean_text('Read [pyVmomi](https://example.com).\n```python\nsecret_code = 1\n```\n<div>VMware</div>')
        self.assertIn('pyVmomi', text)
        self.assertIn('VMware', text)
        self.assertNotIn('secret_code', text)
        self.assertNotIn('example.com', text)


if __name__ == '__main__':
    unittest.main()
