export function Ch06Supervision() {
  return (
    <section className="section">
      <div className="section-num">06.02 · let it crash</div>
      <h2 className="section-title">
        Supervision, and the right way to <em>fail</em>.
      </h2>
      <p className="prose">
        Most languages teach you to handle errors where they happen: catch the exception, retry,
        log, recover. Erlang's culture says the opposite. When something goes wrong, let the actor
        die. Let it crash. A separate actor, its supervisor, watches for crashes and decides what to
        do.
      </p>
      <p className="prose">
        The supervisor's strategies are restricted and named: <strong>one_for_one</strong> (restart
        only the dead child), <strong>one_for_all</strong> (restart all siblings),{' '}
        <strong>rest_for_one</strong> (restart the dead child and everything started after it), and
        a few others. The whole system is a tree of supervisors and workers, and a fault anywhere
        can be contained at the appropriate level.
      </p>

      <div className="pull-quote">
        The error-handling philosophy is "let it crash." Not because crashes are good, but because
        the only honest model of a complex system is one where failures are first-class and
        isolated.
      </div>

      <p className="prose">
        It's a strikingly different mental model. You stop trying to handle every possible error
        inline; instead, you partition the system into supervisable units and decide, in advance,
        what kinds of failure each unit is allowed to have. The result is software with availability
        metrics that look implausible. Ericsson's AXD301 telecom switch, written in Erlang, famously
        achieved nine 9's of uptime in production.
      </p>
      <p className="prose">
        You don't need to write Erlang to take the lesson. Kubernetes' restart policies are
        supervision trees in YAML. Microservices with health checks and orchestrators are
        supervision trees across machines. The actor model and its supervision discipline are a way
        of looking at concurrency that, once you've seen it, is hard to unsee.
      </p>
    </section>
  );
}
