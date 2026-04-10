const LIFECYCLE_STAGES = [
  "New",
  "Assigned",
  "In Progress",
  "Fixed",
  "Testing",
  "Closed",
];

function BugLifecycle({ status, createdAt, resolvedAt }) {
  // Find current stage index; default to 0 ("New") for unknown/missing status
  const currentIndex = Math.max(
    0,
    LIFECYCLE_STAGES.findIndex(
      (s) => s.toLowerCase() === (status || "").toLowerCase()
    )
  );

  return (
    <div className="bug-lifecycle">
      <div className="bug-lifecycle__track">
        {LIFECYCLE_STAGES.map((stage, i) => {
          let stageState;
          if (i < currentIndex) stageState = "completed";
          else if (i === currentIndex) stageState = "active";
          else stageState = "pending";

          const isLast = i === LIFECYCLE_STAGES.length - 1;

          // Optional timestamps
          let timestamp = null;
          if (i === 0 && createdAt) {
            timestamp = new Date(createdAt).toLocaleDateString();
          }
          if (i === LIFECYCLE_STAGES.length - 1 && resolvedAt && stageState === "completed") {
            timestamp = new Date(resolvedAt).toLocaleDateString();
          }

          return (
            <div key={stage} className="bug-lifecycle__step" data-state={stageState}>
              {/* Connector line BEFORE (not on first) */}
              {i > 0 && (
                <div
                  className={`bug-lifecycle__connector ${
                    i <= currentIndex ? "bug-lifecycle__connector--filled" : ""
                  }`}
                />
              )}

              {/* Circle */}
              <div className="bug-lifecycle__circle-wrap">
                <div className={`bug-lifecycle__circle bug-lifecycle__circle--${stageState}`}>
                  {stageState === "completed" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {stageState === "active" && <div className="bug-lifecycle__pulse" />}
                </div>
                <span className={`bug-lifecycle__label bug-lifecycle__label--${stageState}`}>
                  {stage}
                </span>
                {timestamp && (
                  <span className="bug-lifecycle__timestamp">{timestamp}</span>
                )}
              </div>

              {/* Connector line AFTER (not on last) */}
              {!isLast && (
                <div
                  className={`bug-lifecycle__connector ${
                    i < currentIndex ? "bug-lifecycle__connector--filled" : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BugLifecycle;
