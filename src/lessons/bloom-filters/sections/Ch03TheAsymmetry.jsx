import { Chapter } from '../components/Chapter.jsx';

export function Ch03TheAsymmetry() {
  return (
    <Chapter num="03" title="The Asymmetry" anchor="ch-03">
      <p>
        Why does the one-sided error matter so much? Because a Bloom filter is a tool for{' '}
        <em>skipping work</em>. You sit it in front of an expensive thing: a disk read, a network
        call, a cryptographic verification. If the filter says "definitely no," you save the work.
        If it says "probably yes," you do the work anyway, just as you would have.
      </p>
      <p>
        A two-sided filter — one that sometimes lies in either direction — cannot do this job. If
        "no" could be wrong, you'd have to do the work anyway, just to be sure. Which is the same as
        not having a filter at all.
      </p>
      <p>
        The one-sided guarantee is what makes the filter <em>load-bearing</em>.{' '}
        <strong>"No" is final.</strong> <strong>"Yes" is provisional.</strong> Each verdict has a
        clear meaning, and the meanings compose: you can stack a chain of filters in front of a slow
        source of truth, and the chain is correct as long as each link is correct. False positives
        cost wasted lookups. False negatives, were they possible, would cost <em>wrong answers</em>.
        The asymmetry is the whole story.
      </p>
    </Chapter>
  );
}
