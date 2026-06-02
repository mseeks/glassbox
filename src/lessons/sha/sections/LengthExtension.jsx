import { ShieldCheck } from 'lucide-react';
import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';
import LengthExtensionLab from '../labs/LengthExtensionLab.jsx';

export default function LengthExtension() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="05"
          eyebrow="SHA-2 · the scar"
          title="The length-extension"
          italic="trap"
          lede={
            <>
              Here is the one wound SHA-2 carries from its assembly-line design. The final digest{' '}
              <em>is</em> the workpiece, fully exposed. So if you ever publish{' '}
              <code className="ic">H(secret ‖ message)</code> as a signature, an attacker can extend
              it, without ever knowing the secret.
            </>
          }
        />

        <p className="body">
          It sounds impossible. If you don't know the secret, how can you produce a valid tag for a
          longer message? Here is the trick. The tag hands you the exact state the line was in when
          it stopped, so you set the machine back to that state, feed in your own bytes, and out
          comes a tag that the server, recomputing honestly, will accept as genuine. Try it. Change
          the appended text and forge.
        </p>

        <LengthExtensionLab />

        <p className="body">
          This bit real APIs in the 2000s, early Amazon S3 and Flickr signatures among them. Notice
          the shape of the bug. The hash can't tell "this is the <em>final</em> state" from "this is
          a state mid-computation," and that is the same lesson as a hash that can't tell one{' '}
          <em>kind</em> of input from another. The fix is always the same. Give your inputs and
          outputs boundaries, or an attacker will exploit the ambiguity.
        </p>

        <div
          className="reveal"
          style={{
            border: '1px solid var(--jade)',
            borderRadius: 11,
            padding: '15px 17px',
            background: 'var(--jade-glow)',
            margin: '22px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <ShieldCheck size={17} style={{ color: 'var(--jade)' }} />
            <span
              style={{
                fontFamily: 'var(--slab)',
                fontWeight: 600,
                fontSize: 17,
                color: 'var(--jade)',
              }}
            >
              The fix: HMAC
            </span>
          </div>
          <p className="body" style={{ margin: 0 }}>
            Instead of <code className="ic">H(secret ‖ m)</code>, HMAC computes
            <code className="ic">H( key₁ ‖ H( key₂ ‖ m ) )</code>: two nested hashes with two
            key-derived pads. The outer hash buries the inner state behind a whole second pass, so
            the attacker never gets to see a resumable workpiece and never gets a foothold to extend
            from. HMAC isn't a new hash. It's a wrapper that engineers the scar shut. The truncated
            SHA-2 variants get the same immunity for free. We'll see why next.
          </p>
        </div>
      </div>
      <Rule />
    </section>
  );
}
