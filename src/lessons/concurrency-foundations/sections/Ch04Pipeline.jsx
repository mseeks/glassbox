import { PatternDiagram } from '../components/PatternDiagram.jsx';

export function Ch04Pipeline() {
  return (
    <section className="section">
      <div className="section-num">04.03 — staged transformation</div>
      <h2 className="section-title">
        The <em>pipeline</em>.
      </h2>
      <p className="prose">
        When work is a sequence of transformations, each stage can run on its own thread (or
        goroutine, or task). Channels between stages buffer the difference in stage speeds. The
        throughput of the pipeline is the throughput of its slowest stage; that's the bottleneck you
        optimize when you optimize anything at all.
      </p>

      <PatternDiagram pattern="pipeline" />

      <p className="prose">
        Pipelines compose beautifully with fan-out: any one stage can be a parallel pool, with
        channels in front and behind acting as load balancer and merge. UNIX pipes are a
        non-concurrent version of the same idea; gstreamer, ffmpeg, and most ETL frameworks are
        concurrent versions, and Go channels make the pattern almost casually expressible.
      </p>
    </section>
  );
}
