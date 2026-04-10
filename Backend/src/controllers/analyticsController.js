const Bug = require("../models/Bug");

const formatAvgResolutionTime = (avgResolutionMs) => {
  if (!avgResolutionMs || avgResolutionMs <= 0) {
    return "0.0 hours";
  }

  const hours = avgResolutionMs / (1000 * 60 * 60);
  if (hours >= 24) {
    return `${(hours / 24).toFixed(1)} days`;
  }

  return `${hours.toFixed(1)} hours`;
};

const getAnalytics = async (_req, res, next) => {
  try {
    const reportedPromise = Bug.aggregate([
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              {
                $cond: [
                  { $lt: ["$_id.week", 10] },
                  { $concat: ["0", { $toString: "$_id.week" }] },
                  { $toString: "$_id.week" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { period: 1 } },
    ]);

    const resolvedPromise = Bug.aggregate([
      {
        $match: {
          resolvedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$resolvedAt" },
            week: { $isoWeek: "$resolvedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              {
                $cond: [
                  { $lt: ["$_id.week", 10] },
                  { $concat: ["0", { $toString: "$_id.week" }] },
                  { $toString: "$_id.week" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { period: 1 } },
    ]);

    const priorityPromise = Bug.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalBugsPromise = Bug.countDocuments();
    const closedBugsPromise = Bug.countDocuments({ status: "Closed" });

    const avgResolutionPromise = Bug.aggregate([
      {
        $match: {
          resolvedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionMs: {
            $subtract: ["$resolvedAt", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionMs: { $avg: "$resolutionMs" },
        },
      },
    ]);

    const [reportedAgg, resolvedAgg, priorityAgg, totalBugs, closedBugs, avgAgg] =
      await Promise.all([
        reportedPromise,
        resolvedPromise,
        priorityPromise,
        totalBugsPromise,
        closedBugsPromise,
        avgResolutionPromise,
      ]);

    const trendMap = new Map();

    for (const entry of reportedAgg) {
      trendMap.set(entry.period, {
        period: entry.period,
        reported: entry.count,
        resolved: 0,
      });
    }

    for (const entry of resolvedAgg) {
      if (!trendMap.has(entry.period)) {
        trendMap.set(entry.period, {
          period: entry.period,
          reported: 0,
          resolved: entry.count,
        });
      } else {
        trendMap.get(entry.period).resolved = entry.count;
      }
    }

    const trend = Array.from(trendMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    const priorityBreakdown = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    for (const row of priorityAgg) {
      if (Object.prototype.hasOwnProperty.call(priorityBreakdown, row._id)) {
        priorityBreakdown[row._id] = row.count;
      }
    }

    const resolutionRate =
      totalBugs > 0 ? Number(((closedBugs / totalBugs) * 100).toFixed(2)) : 0;

    const avgResolutionMs = avgAgg.length > 0 ? avgAgg[0].avgResolutionMs : 0;
    const avgResolutionTime = formatAvgResolutionTime(avgResolutionMs);

    res.json({
      trend,
      priorityBreakdown,
      resolutionRate,
      avgResolutionTime,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};
