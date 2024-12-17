import { RequestHandler } from "express";
import OpenAI from "openai";
import { sentimentAnalysis } from "../lib/sentimentAnalysis";
import { translate } from "../lib/translate";
import { PrismaClient } from "@prisma/client";
import { empty } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export const getChat: RequestHandler = (request, response, next) => {
  response.send({
    status: "success",
  });
};

export const createChat: RequestHandler = async (request, response, next) => {
  try {
    const messageUser = request.body.message;

    const message = await sentimentAnalysis(messageUser);

    if (!message) {
      throw new Error("Something went wrong!");
    }
    const data = JSON.parse(message);

    response.send({
      status: "success",
      data: data,
    });
  } catch (e) {
    next(e);
  }
};

export const translateChat: RequestHandler = async (
  request,
  response,
  next
) => {
  try {
    const message = request.body.message as string | undefined;
    const language = request.body.language as string | undefined;
    const data = await translate(message, language);

    response.send({
      status: "success",
      data: data,
    });
  } catch (error) {}
};

export const aiResponse: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.params.userId as string | undefined;
    const message = request.body.message as string | undefined;
    const language = request.body.language as string | undefined;
    const dataList = await Promise.allSettled([
      sentimentAnalysis(message),
      translate(message, language),
    ]);
    const [sentiment, translation] = (
      dataList as { status: string; value: string }[]
    ).map((data) => data.value);
    const dataProcessed = {
      sentiment: JSON.parse(sentiment) as {
        stats: { urgency: number; sentiment: number; topic: string };
        response: string;
      },
      translation,
    };

    await prisma.message.create({
      data: {
        message: message || "",
        sentiment: dataProcessed.sentiment.stats.sentiment,
        topic: dataProcessed.sentiment.stats.topic,
        translation: dataProcessed.translation,
        urgency: dataProcessed.sentiment.stats.urgency,
        userId: Number(userId),
      },
    });

    response.send({
      status: "success",
      dataList: dataProcessed,
    });
  } catch (e) {
    next(e);
  }
};
