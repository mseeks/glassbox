import { HardDrive, Search, GitMerge } from 'lucide-react';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

// §I — the three jobs one file must do at once. Icons stay in the view (a static
// presentational choice, not engine logic).
const JOBS = [
  {
    ic: HardDrive,
    t: 'Write in one pass',
    d: 'Streamed front to back, sorted, with no seeking back. The disk punishes scattered writes; a good file never asks for one.',
  },
  {
    ic: Search,
    t: 'Find one key fast',
    d: 'Locate a single key without reading the whole file. A lookup cannot afford to scan a billion rows to answer one question.',
  },
  {
    ic: GitMerge,
    t: 'Merge cheaply',
    d: 'Combine several of these files into one without loading everything into memory. Merging is exactly what compaction does.',
  },
];

export default function Brief() {
  return (
    <Section id="brief">
      <SectionHeading
        roman="I"
        kicker="the brief"
        title="Three jobs, one file"
        dek="Hand a single file a billion sorted pairs and it must be good at three things at once. The whole format is shaped by them."
      />
      <div className="sst-g2">
        <div className="sst-prose">
          <p className="sst-dropcap">
            The structure has a precise job description. It will hold key–value pairs — a city to
            its code, a user to a record — and it will be enormous, far larger than memory. So it
            cannot be clever in the ways an in-memory structure can. It can only be clever about how
            it touches the disk.
          </p>
          <p>
            Hold the three jobs to the right in mind as we go. Every decision in the design — the
            blocks, the sparse index, the footer pinned to the very end — is the file answering one
            of them. Get all three at once and you have a{' '}
            <span className="ox">sorted string table</span>.
          </p>
        </div>
        <div className="sst-reveal">
          <div className="sst-tri">
            {JOBS.map((j, i) => {
              const Ic = j.ic;
              return (
                <div key={j.t} className="sst-job">
                  <div className="sst-job-head">
                    <span className="sst-job-ic">
                      <Ic size={18} aria-hidden="true" />
                    </span>
                    <span className="sst-tiny">job {i + 1}</span>
                  </div>
                  <h3 className="sst-h3" style={{ fontSize: 19, margin: '8px 0 4px' }}>
                    {j.t}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14.5,
                      color: 'var(--ink-2)',
                      lineHeight: 1.5,
                    }}
                  >
                    {j.d}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
