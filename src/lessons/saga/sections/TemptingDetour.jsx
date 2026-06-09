import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Callout from '../components/Callout.jsx';
import TwoPhaseCommitLab from '../labs/TwoPhaseCommitLab.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';

// Canto II — two-phase commit, and the freeze it hides. The obvious fix is to
// re-appoint a referee; it works until the coordinator dies at the worst moment.
export default function TemptingDetour() {
  return (
    <Canto
      n="Canto II"
      kicker="the tempting detour"
      id="canto-2"
      title="Two-phase commit, and the freeze it hides"
      lede="The obvious fix is to appoint a new referee. It works — until the referee dies at the worst moment."
    >
      <Prose drop>
        <p>
          The first instinct is to re-appoint an authority: a <em>coordinator</em> running{' '}
          <b>two-phase commit</b> (2PC). Phase one — it asks every service to <em>prepare</em>: do
          all the work and lock the rows, but do not commit. Phase two — once all have voted yes, it
          tells them to commit. While every machine stays alive, it is flawless; the lock-step makes
          four services behave like one.
        </p>
        <p>
          The flaw is the gap between the vote and the verdict. If the coordinator dies there, every
          participant is stranded: it has voted yes and is holding locks, but it cannot commit alone
          (the others may have been told to abort) nor abort alone (the others may have committed).
          It can only wait. In the language of the{' '}
          <em>
            <LessonLink to="cap-pacelc">CAP theorem</LessonLink>
          </em>{' '}
          — under a partition you may keep consistency or availability, not both — 2PC plants its
          flag firmly in consistency, and pays in availability.
        </p>
      </Prose>
      <div className="sg-rv">
        <TwoPhaseCommitLab />
      </div>
      <div className="sg-rv">
        <Callout kind="warn" label="the real cost">
          The blocking is not a bug to be patched. It is the price of insisting on a single atomic
          instant across machines that can fail independently. To stay available, you must give that
          insistence up.
        </Callout>
      </div>
    </Canto>
  );
}
