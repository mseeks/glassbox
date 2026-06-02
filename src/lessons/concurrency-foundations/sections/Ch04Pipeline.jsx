import { PatternDiagram } from '../components/PatternDiagram.jsx';

export function Ch04Pipeline() {
  return (
    <section className="section">
      <div className="section-num">04.03 · staged transformation</div>
      <h2 className="section-title">
        The <em>pipeline</em>.
      </h2>
      <p className="prose">
        When work is a sequence of transformations, each stage can run on its own thread, goroutine,
        or task. Channels between stages buffer the difference in stage speeds. The throughput of
        the whole pipeline is just the throughput of its slowest stage, and that slowest stage is
        the one bottleneck you optimize when you optimize anything at all. Find it first.
      </p>

      <PatternDiagram pattern="pipeline" />

      <p className="prose">
        Pipelines compose beautifully with fan-out: any one stage can be a parallel pool, with
        channels in front and behind acting as load balancer and merge. UNIX pipes are a
        non-concurrent version of the same idea. Concurrent versions are everywhere, from gstreamer
        to ffmpeg to most ETL frameworks, and Go channels make the pattern almost casually
        expressible.
      </p>
    </section>
  );
}
