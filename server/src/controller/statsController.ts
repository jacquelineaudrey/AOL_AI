import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const prisma = new PrismaClient();
export const getStats: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.params.userId as string | undefined;

    // Coversations in this month
    const convRate = await prisma.$queryRaw<{ totalMessage: string }[]>`
    SELECT COUNT(*) AS "totalMessage"
    FROM "Message" m 
    WHERE EXTRACT(MONTH FROM m."createdAt") = EXTRACT(MONTH FROM NOW())
    `;

    // Most frequent topic
    const mostTopic = await prisma.$queryRaw<
      { topic: string; topicFrequency: number }[]
    >`
      SELECT m."topic", COUNT(m."topic") AS "topicFrequency"
      FROM "Message" m
      GROUP BY m."topic"
      ORDER BY COUNT(m."topic") DESC
      LIMIT 1;
    `;

    // Mood Distribution
    const moodDistribution = await prisma.$queryRaw<
      { sentiment: number; count: number }[]
    >`
      SELECT m."sentiment", COUNT(*) AS "count"
      FROM "Message" m
      GROUP BY m."sentiment";
    `;

    // Average urgency per week
    const avgUrgency = await prisma.$queryRaw<{ averageUrgency: number }[]>`
      SELECT ROUND(AVG(m."urgency"), 2) AS "averageUrgency"
      FROM "Message" m
      WHERE m."createdAt" >= NOW() - INTERVAL '1 week';
    `;

    // Sentiment rate for each day in this week
    const sentimentRateWeek = await prisma.$queryRaw<
      { day: string; sentimentRate: string }[]
    >`
      SELECT TO_CHAR(m."createdAt", 'Day') AS "day",
             ROUND(AVG(m."sentiment"), 2) AS "sentimentRate"
      FROM "Message" m
      WHERE m."createdAt" >= DATE_TRUNC('week', NOW())
      GROUP BY TO_CHAR(m."createdAt", 'Day')
      ORDER BY MIN(m."createdAt");
    `;

    const moodSummary = {
      "Very Positive": 0,
      Positive: 0,
      Neutral: 0,
      Negative: 0,
      "Very Negative": 0,
    };

    let totalMessages = 0;

    moodDistribution.forEach((item) => {
      const sentiment = Number(item.sentiment);
      const count = Number(item.count);
      totalMessages += count;

      if (sentiment >= 1.0 && sentiment <= 2.0) {
        moodSummary["Very Positive"] += count;
      } else if (sentiment > 2.0 && sentiment <= 4.0) {
        moodSummary.Positive += count;
      } else if (sentiment > 4.0 && sentiment <= 6.0) {
        moodSummary.Neutral += count;
      } else if (sentiment > 6.0 && sentiment <= 8.0) {
        moodSummary.Negative += count;
      } else if (sentiment > 8.0 && sentiment <= 10.0) {
        moodSummary["Very Negative"] += count;
      }
    });

    const moodPercentages = Object.fromEntries(
      Object.entries(moodSummary).map(([key, value]) => [
        key,
        totalMessages > 0
          ? ((value / totalMessages) * 100).toFixed(2) + "%"
          : "0%",
      ])
    );

    const totalConversation = convRate[0]?.totalMessage
      ? Number(convRate[0].totalMessage)
      : 0;

    response.json({
      status: "success",
      dataList: {
        totalConversation,
        mostTopic:
          mostTopic.map((topic) => {
            return {
              ...topic,
              topicFrequency: Number(topic.topicFrequency),
            };
          }) || null,
        averageMood: moodPercentages,
        averageUrgencyPerWeek: avgUrgency[0]?.averageUrgency || 0,
        sentimentRateThisWeek: sentimentRateWeek.map((s) => ({
          day: s.day.trim(),
          sentimentRate: `${s.sentimentRate}`,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
