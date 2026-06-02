import Chapter from '../components/Chapter.jsx';
import CoinLab from '../labs/CoinLab.jsx';

// 02 · The rarest flicker — the coin-flip intuition: the longest run of leading
// zeros is a fingerprint of how many tries happened.
export default function Chapter02() {
  return (
    <Chapter n="02" title="The rarest flicker">
      <p className="lead">
        Forget data structures. Picture a party where everyone flips a coin over and over and writes
        down their longest opening run of heads.
      </p>
      <p>
        You walk in and learn one fact: the longest opening run anyone got was three. How many
        people are here? A run of three has probability one in eight, so you would expect to need
        about eight people to witness one. A run of ten — one in a thousand — would whisper about a
        thousand people.{' '}
        <strong>The rarest event you observe is a fingerprint of how many tries happened</strong>,
        because rare things only surface after many attempts.
      </p>
      <div className="pull">
        The rarest run encodes the size of the crowd — so the maximum run of leading zeros becomes
        an <em>estimate of the count</em>.
      </div>
      <p>
        Below, each item is a coin sequence; the leading zeros before the first 1 are its run. Push
        the crowd size up and watch the longest run climb with it — then run the trials repeatedly
        to feel the catch.
      </p>
      <CoinLab />
      <p>
        The idea is exactly right and the precision is hopeless. A lone coin-run can only ever guess
        a power of two, and re-rolling flings it wildly. Everything from here is a campaign against
        that variance.
      </p>
    </Chapter>
  );
}
