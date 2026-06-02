import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import Callout from '../components/Callout.jsx';
import SearchLab from '../labs/SearchLab.jsx';

// §III — lookup. Following the signposts down: load a page, binary-search
// within the fat node, follow the pointer, repeat. Renders the search lab.
export default function Search() {
  return (
    <Section roman="III" kicker="Lookup" title="Following the signposts down">
      <Reveal base="bt-rev">
        <p className="bt-p">
          To search, load the root page, binary-search <span className="bt-em">within</span> that
          fat node to pick the right gap, follow the pointer, fetch the next page, and repeat. Each
          fetch eliminates not half the remaining keys but <strong>255 out of every 256</strong>{' '}
          &mdash; the same precious seek, extracting hundreds of times more decisive information.
        </p>
      </Reveal>
      <SearchLab />
      <Callout title="The asymmetry that drives everything">
        A fetch is precious, so make each one count. It&rsquo;s the same move as packing every probe
        into one CPU cache line, just one level up the memory hierarchy &mdash; disk page instead of
        cache line.
      </Callout>
    </Section>
  );
}
