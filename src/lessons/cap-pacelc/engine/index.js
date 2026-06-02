export function analyzeQuorum({ n, r, w }) {
  const safeR = Math.min(r, n);
  const safeW = Math.min(w, n);
  const strong = safeR + safeW > n;
  const majority = Math.ceil((n + 1) / 2);

  let profile = '';
  let profileDesc = '';
  if (safeR === 1 && safeW === 1) {
    profile = 'Maximum availability';
    profileDesc = 'Any single replica can answer. Fastest, weakest. Eventual consistency.';
  } else if (safeR === 1 && safeW === n) {
    profile = 'Read-optimized';
    profileDesc =
      'Reads hit any replica; writes wait for every replica. Strong reads, slow writes, no availability for writes during partition.';
  } else if (safeR === n && safeW === 1) {
    profile = 'Write-optimized';
    profileDesc =
      'Writes finish on one replica; reads check all. Strong reads, fast writes, no availability for reads during partition.';
  } else if (strong && safeR === majority && safeW === majority) {
    profile = 'Balanced strong (quorum)';
    profileDesc = 'Majority for both. Survives ⌊(N-1)/2⌋ failures. The Raft/Paxos sweet spot.';
  } else if (strong) {
    profile = 'Strong consistency';
    profileDesc =
      'R + W > N: every read and write quorum must overlap by at least one node, so reads see the latest committed write.';
  } else {
    profile = 'Eventual consistency';
    profileDesc =
      'R + W ≤ N: the read and write quora may not overlap, so a read can miss a recent write.';
  }

  return {
    safeR,
    safeW,
    strong,
    profile,
    profileDesc,
    writeFailTol: n - safeW,
    readFailTol: n - safeR,
  };
}
