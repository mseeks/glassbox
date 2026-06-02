import Chapter from '../components/Chapter.jsx';
import HookLab from '../labs/HookLab.jsx';

// 01 · The impossible ask — why an exact distinct count doesn't scale, and the
// relaxed question that does.
export default function Chapter01() {
  return (
    <Chapter n="01" title="The impossible ask">
      <p className="lead">
        You want one number: how many <em className="k">distinct</em> things have I seen? Unique
        visitors today. Distinct addresses hitting a port. Unique search terms in a firehose.
      </p>
      <p>
        The exact way is obvious and brutal. Keep a set, add everything, report its size. For a
        billion distinct items that is gigabytes of memory, and you rarely want just one such count.
        You want thousands at once: per page, per hour, per campaign, per shard, each one its own
        growing set. The exact approach scales with the data. The data does not stop.
      </p>
      <p>
        So we relax the question.{' '}
        <strong>
          Can I estimate the distinct count in tiny, fixed memory, accepting a small bounded error?
        </strong>{' '}
        The meter below shows the stakes. The exact set sits on top, the estimator beneath it.
      </p>
      <HookLab />
      <p>
        That flat cyan bar is the whole promise. Roughly a billion distinct items, estimated to
        within about one percent, in around twelve kilobytes: a budget fixed before the first item
        arrives. The rest of this is one idea, made progressively less terrible.
      </p>
    </Chapter>
  );
}
