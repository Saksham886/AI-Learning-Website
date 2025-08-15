import api from "./index";

export const explain = (topic,level) => {
  return api.post("/ai/explain", { topic,level });
};

export const quiz=(topic,level,num_questions)=>{
  return api.post("ai/quiz",{topic,level,num_questions});
};