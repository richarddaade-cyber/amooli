export interface GreIssueTopic {
  id: number;
  prompt: string;
  directions: string;
  accessCode: string;
  category?: string;
}

// All 159 Official ETS GRE Analytical Writing Issue Pool Topics
export const OFFICIAL_GRE_ISSUE_POOL: GreIssueTopic[] = [
  {
    "id": 1,
    "accessCode": "ISSUE001",
    "prompt": "Governments should place few, if any, restrictions on scientific research and development.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 2,
    "accessCode": "ISSUE002",
    "prompt": "The best way to teach is to praise positive actions and ignore negative ones.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 3,
    "accessCode": "ISSUE003",
    "prompt": "Governments should offer college and university education free of charge to all students.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 4,
    "accessCode": "ISSUE004",
    "prompt": "The luxuries and conveniences of contemporary life prevent people from developing into truly strong and independent individuals.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 5,
    "accessCode": "ISSUE005",
    "prompt": "In any field of inquiry, the beginner is more likely than the expert to make important contributions.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 6,
    "accessCode": "ISSUE006",
    "prompt": "The surest indicator of a great nation is represented not by the achievements of its rulers, artists, or scientists, but by the general welfare of its people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 7,
    "accessCode": "ISSUE007",
    "prompt": "The best way to teach — whether as an educator, employer, or parent — is to praise positive actions and ignore negative ones.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 8,
    "accessCode": "ISSUE008",
    "prompt": "Teachers' salaries should be based on their students' academic performance.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 9,
    "accessCode": "ISSUE009",
    "prompt": "Society should make efforts to save endangered species only if the potential extinction of those species is the result of human activities.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 10,
    "accessCode": "ISSUE010",
    "prompt": "College students should base their choice of a field of study on the availability of jobs in that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 11,
    "accessCode": "ISSUE011",
    "prompt": "As we acquire more knowledge, things do not become more comprehensible, but more complex and mysterious.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 12,
    "accessCode": "ISSUE012",
    "prompt": "In any situation, progress requires discussion among people who have contrasting points of view.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 13,
    "accessCode": "ISSUE013",
    "prompt": "Educational institutions should dissuade students from pursuing fields of study in which they are unlikely to succeed.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 14,
    "accessCode": "ISSUE014",
    "prompt": "Governments should not fund any scientific research whose consequences are unclear.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 15,
    "accessCode": "ISSUE015",
    "prompt": "Society should identify those children who have special talents and provide training for them at an early age to develop their talents.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 16,
    "accessCode": "ISSUE016",
    "prompt": "It is primarily through our identification with social groups that we define ourselves.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 17,
    "accessCode": "ISSUE017",
    "prompt": "College students should be encouraged to pursue subjects that interest them rather than the courses that seem most likely to lead to jobs.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 18,
    "accessCode": "ISSUE018",
    "prompt": "Claim: When planning courses, educators should take into account the interests and suggestions of their students.\nReason: Students are more motivated to learn when they are interested in what they are studying.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 19,
    "accessCode": "ISSUE019",
    "prompt": "The greatness of individuals can be decided only by those who live after them, not by their contemporaries.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 20,
    "accessCode": "ISSUE020",
    "prompt": "Students should always question what they are taught instead of accepting it passively.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 21,
    "accessCode": "ISSUE021",
    "prompt": "The increasingly rapid pace of life today causes more problems than it solves.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 22,
    "accessCode": "ISSUE022",
    "prompt": "Claim: It is no longer possible for a society to regard any living man or woman as a hero.\nReason: The reputation of anyone who is subjected to media scrutiny will eventually be diminished.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 23,
    "accessCode": "ISSUE023",
    "prompt": "Competition for high grades seriously limits the quality of learning at all levels of education.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 24,
    "accessCode": "ISSUE024",
    "prompt": "Universities should require every student to take a variety of courses outside the student's field of study.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 25,
    "accessCode": "ISSUE025",
    "prompt": "Educators should find out what students want included in the curriculum and then offer it to them.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 26,
    "accessCode": "ISSUE026",
    "prompt": "Educators should teach facts only after their students have studied the ideas, trends, and concepts that help explain those facts.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 27,
    "accessCode": "ISSUE027",
    "prompt": "Claim: We can usually learn much more from people whose views we share than from those whose views contradict our own.\nReason: Disagreement can cause stress and inhibit learning.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 28,
    "accessCode": "ISSUE028",
    "prompt": "Government officials should rely on their own judgment rather than unquestioningly carry out the will of the people they serve.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 29,
    "accessCode": "ISSUE029",
    "prompt": "Young people should be encouraged to pursue long-term, realistic goals rather than seek immediate fame and recognition.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 30,
    "accessCode": "ISSUE030",
    "prompt": "The best way to teach is to praise positive actions and ignore negative ones.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 31,
    "accessCode": "ISSUE031",
    "prompt": "If a goal is worthy, then any means taken to attain it are justifiable.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 32,
    "accessCode": "ISSUE032",
    "prompt": "In order to become well-rounded individuals, all college students should be required to take courses in which they read poetry, novels, mythology, and other types of imaginative literature.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 33,
    "accessCode": "ISSUE033",
    "prompt": "In order for any work of art — for example, a film, a novel, a poem, or a song — to have merit, it must be understandable to most people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 34,
    "accessCode": "ISSUE034",
    "prompt": "Many important discoveries or creations are accidental: it is usually while seeking the answer to one question that we come across the answer to another.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 35,
    "accessCode": "ISSUE035",
    "prompt": "The main benefit of the study of history is to dispel the illusion that people living now are significantly different from people who lived in earlier times.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 36,
    "accessCode": "ISSUE036",
    "prompt": "Learning is primarily a matter of personal discipline; students cannot be motivated by school or college alone.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 37,
    "accessCode": "ISSUE037",
    "prompt": "Scientists and other researchers should focus their research on areas that are likely to benefit the greatest number of people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 38,
    "accessCode": "ISSUE038",
    "prompt": "Politicians should pursue common ground and reasonable consensus rather than elusive ideals.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 39,
    "accessCode": "ISSUE039",
    "prompt": "People should undertake risky action only after they have carefully considered its consequences.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 40,
    "accessCode": "ISSUE040",
    "prompt": "Leaders are created by the demands that are placed on them.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 41,
    "accessCode": "ISSUE041",
    "prompt": "There is little justification for society to make extraordinary efforts — especially at a great cost in money and jobs — to save endangered animal or plant species.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 42,
    "accessCode": "ISSUE042",
    "prompt": "The human mind will always be superior to machines because machines are only tools of human minds.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 43,
    "accessCode": "ISSUE043",
    "prompt": "People who are the most deeply committed to an idea or policy are also the most critical of it.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 44,
    "accessCode": "ISSUE044",
    "prompt": "Some people believe that society should try to save every plant and animal species, despite the expense to humans in effort, time, and financial well-being. Others believe that society need not make extraordinary efforts, especially at a great cost in money and jobs, to save endangered species.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 45,
    "accessCode": "ISSUE045",
    "prompt": "Some people believe that the purpose of education is to free the mind and the spirit. Others believe that formal education tends to restrain our minds and spirits rather than set them free.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 46,
    "accessCode": "ISSUE046",
    "prompt": "Some people believe it is often necessary, even desirable, for political leaders to withhold information from the public. Others believe that the public has a right to be fully informed.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 47,
    "accessCode": "ISSUE047",
    "prompt": "Claim: Universities should require every student to take a variety of courses outside the student's major field of study.\nReason: Acquiring knowledge of various academic disciplines is the best way to become truly educated.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 48,
    "accessCode": "ISSUE048",
    "prompt": "Young people should be encouraged to pursue long-term, realistic goals rather than seek immediate fame and recognition.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 49,
    "accessCode": "ISSUE049",
    "prompt": "Governments should not fund any scientific research whose consequences are unclear.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 50,
    "accessCode": "ISSUE050",
    "prompt": "Knowing about the past cannot help people to make important decisions today.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 51,
    "accessCode": "ISSUE051",
    "prompt": "In this age of intensive media coverage, it is no longer possible for a society to regard any living man or woman as a hero.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 52,
    "accessCode": "ISSUE052",
    "prompt": "We can usually learn much more from people whose views we share than from people whose views contradict our own.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 53,
    "accessCode": "ISSUE053",
    "prompt": "The most effective way to understand contemporary culture is to analyze the trends of its youth.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 54,
    "accessCode": "ISSUE054",
    "prompt": "People's attitudes are determined more by their immediate situation or surroundings than by society as a whole.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 55,
    "accessCode": "ISSUE055",
    "prompt": "Nations should suspend government funding for the arts when significant numbers of their citizens are hungry or unemployed.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 56,
    "accessCode": "ISSUE056",
    "prompt": "All parents should be required to volunteer time to their children's schools.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 57,
    "accessCode": "ISSUE057",
    "prompt": "Colleges and universities should require their students to spend at least one semester studying in a foreign country.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 58,
    "accessCode": "ISSUE058",
    "prompt": "Teachers' salaries should be based on the academic performance of their students.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 59,
    "accessCode": "ISSUE059",
    "prompt": "It is no longer possible for a society to regard any living man or woman as a hero.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 60,
    "accessCode": "ISSUE060",
    "prompt": "Some people believe that in order to thrive, a society must put its own overall success before the well-being of its individual citizens. Others believe that the well-being of a society can only be measured by the general welfare of all its people.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 61,
    "accessCode": "ISSUE061",
    "prompt": "Claim: Any piece of information referred to as a fact should be mistrusted, since it may well be proven false in the future.\nReason: Much of the information that people assume is factual actually turns out to be inaccurate.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 62,
    "accessCode": "ISSUE062",
    "prompt": "Claim: Nations should suspend government funding for the arts when significant numbers of their citizens are hungry or unemployed.\nReason: It is inappropriate — and, perhaps, even cruel — to use public resources to fund the arts when people's basic needs are not being met.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 63,
    "accessCode": "ISSUE063",
    "prompt": "Claim: Many problems of modern society cannot be solved by laws and the legal system.\nReason: Laws cannot change what is in people's hearts or minds.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 64,
    "accessCode": "ISSUE064",
    "prompt": "Educators should take students' interests into account when planning the content of the courses they teach.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 65,
    "accessCode": "ISSUE065",
    "prompt": "The primary goal of technological advancement should be to increase people's efficiency so that they have more leisure time.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 66,
    "accessCode": "ISSUE066",
    "prompt": "Educators should base their assessment of students' learning not on students' grasp of facts but on the ability to explain the ideas, trends, and concepts that those facts illustrate.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 67,
    "accessCode": "ISSUE067",
    "prompt": "Unfortunately, in contemporary society, creating an appealing image has become more important than the reality or truth behind that image.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 68,
    "accessCode": "ISSUE068",
    "prompt": "The effectiveness of a country's leaders is best measured by examining the well-being of that country's citizens.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 69,
    "accessCode": "ISSUE069",
    "prompt": "All parents should be required to volunteer time to their children's schools.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 70,
    "accessCode": "ISSUE070",
    "prompt": "A nation should require all of its students to study the same national curriculum until they enter college.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 71,
    "accessCode": "ISSUE071",
    "prompt": "Colleges and universities should require their students to spend at least one semester studying in a foreign country.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 72,
    "accessCode": "ISSUE072",
    "prompt": "Educational institutions should actively encourage their students to choose fields of study in which jobs are plentiful.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 73,
    "accessCode": "ISSUE073",
    "prompt": "People's behavior is largely determined by forces not of their own making.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 74,
    "accessCode": "ISSUE074",
    "prompt": "Colleges and universities should require their students to spend at least one semester studying in a foreign country.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 75,
    "accessCode": "ISSUE075",
    "prompt": "Although innovations such as video, computers, and the Internet seem to offer schools improved methods for instructing students, these technologies all too often distract from real learning.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 76,
    "accessCode": "ISSUE076",
    "prompt": "Universities should require every student to take a variety of courses outside the student's field of study.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 77,
    "accessCode": "ISSUE077",
    "prompt": "The best ideas arise from a passionate interest in commonplace things.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 78,
    "accessCode": "ISSUE078",
    "prompt": "To be an effective leader, a public official must maintain the highest ethical and moral standards.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 79,
    "accessCode": "ISSUE079",
    "prompt": "Claim: Imagination is a more valuable asset than experience.\nReason: People who lack experience are free to imagine what is possible without the constraints of established habits and attitudes.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 80,
    "accessCode": "ISSUE080",
    "prompt": "In most professions and academic fields, imagination is more important than knowledge.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 81,
    "accessCode": "ISSUE081",
    "prompt": "To be an effective leader, a public official must maintain the highest ethical and moral standards.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 82,
    "accessCode": "ISSUE082",
    "prompt": "Critical judgment of work in any given field has little value unless it comes from someone who is an expert in that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 83,
    "accessCode": "ISSUE083",
    "prompt": "Some people believe that scientific discoveries have given us a much better understanding of the world around us. Others believe that science has revealed to us that the world is infinitely more complex than we ever realized.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 84,
    "accessCode": "ISSUE084",
    "prompt": "Critical judgment of work in any given field has little value unless it comes from someone who is an expert in that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 85,
    "accessCode": "ISSUE085",
    "prompt": "In any profession — business, politics, education, government — those in power should step down after five years.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 86,
    "accessCode": "ISSUE086",
    "prompt": "Requiring university students to take a variety of courses outside their major fields of study is the best way to ensure that students become truly educated.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 87,
    "accessCode": "ISSUE087",
    "prompt": "Claim: The surest indicator of a great nation is not the achievements of its rulers, artists, or scientists.\nReason: The surest indicator of a great nation is actually the welfare of all its people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 88,
    "accessCode": "ISSUE088",
    "prompt": "Any leader who is quickly and easily influenced by shifts in popular opinion will accomplish little.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 89,
    "accessCode": "ISSUE089",
    "prompt": "Government officials should rely on their own judgment rather than unquestioningly carry out the will of the people whom they serve.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 90,
    "accessCode": "ISSUE090",
    "prompt": "A nation should require all of its students to study the same national curriculum until they enter college.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 91,
    "accessCode": "ISSUE091",
    "prompt": "It is primarily in cities that a nation's cultural traditions are generated and preserved.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 92,
    "accessCode": "ISSUE092",
    "prompt": "We can learn much more from people whose views we share than from people whose views contradict our own.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 93,
    "accessCode": "ISSUE093",
    "prompt": "When old buildings stand on ground that modern planners feel could be better used for modern purposes, modern development should be given precedence over the preservation of historic buildings.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 94,
    "accessCode": "ISSUE094",
    "prompt": "Claim: The surest indicator of a great nation must be the achievements of its rulers, artists, or scientists.\nReason: Great achievements by a nation's rulers, artists, or scientists will ensure a good life for the majority of that nation's people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 95,
    "accessCode": "ISSUE095",
    "prompt": "Some people claim that you can tell whether a nation is great by looking at the achievements of its rulers, artists, or scientists. Others argue that the surest indicator of a great nation is, in fact, the general welfare of all its people.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 96,
    "accessCode": "ISSUE096",
    "prompt": "The best way to understand the character of a society is to examine the character of the men and women that the society chooses as its heroes or its role models.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 97,
    "accessCode": "ISSUE097",
    "prompt": "All college and university students would benefit from spending at least one semester studying in a foreign country.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 98,
    "accessCode": "ISSUE098",
    "prompt": "Some people claim that a nation's government should preserve its wilderness areas in their natural state. Others argue that these areas should be developed for potential economic gain.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 99,
    "accessCode": "ISSUE099",
    "prompt": "In most professions and academic fields, imagination is more important than knowledge.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 100,
    "accessCode": "ISSUE100",
    "prompt": "The surest indicator of a great nation is not the achievements of its rulers, artists, or scientists, but the general well-being of all its people.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 101,
    "accessCode": "ISSUE101",
    "prompt": "Some people argue that successful leaders in government, industry, or other fields must be highly competitive. Other people claim that in order to be successful, a leader must be willing and able to cooperate with others.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 102,
    "accessCode": "ISSUE102",
    "prompt": "College students should base their choice of a field of study on the availability of jobs in that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 103,
    "accessCode": "ISSUE103",
    "prompt": "Some people believe that corporations have a responsibility to promote the well-being of the societies and environments in which they operate. Others believe that the only responsibility of corporations, provided they operate within the law, is to make as much money as possible.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 104,
    "accessCode": "ISSUE104",
    "prompt": "Claim: Researchers should not limit their investigations to only those areas in which they expect to discover something that has an immediate, practical application.\nReason: It is impossible to predict the outcome of a line of research with any certainty.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 105,
    "accessCode": "ISSUE105",
    "prompt": "Some people believe that our ever-increasing use of technology significantly reduces our opportunities for human interaction. Other people believe that technology provides us with new and better ways to communicate and connect with one another.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 106,
    "accessCode": "ISSUE106",
    "prompt": "Claim: Knowing about the past cannot help people to make important decisions today.\nReason: The world today is significantly more complex than it was even in the relatively recent past.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 107,
    "accessCode": "ISSUE107",
    "prompt": "Claim: Knowing about the past cannot help people to make important decisions today.\nReason: We are not able to make connections between current events and past events until we have some distance from both.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 108,
    "accessCode": "ISSUE108",
    "prompt": "Educational institutions should actively encourage their students to choose fields of study that will prepare them for lucrative careers.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 109,
    "accessCode": "ISSUE109",
    "prompt": "Educational institutions should actively encourage their students to choose fields of study in which jobs are plentiful.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 110,
    "accessCode": "ISSUE110",
    "prompt": "Educational institutions have a responsibility to dissuade students from pursuing fields of study in which they are unlikely to succeed.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 111,
    "accessCode": "ISSUE111",
    "prompt": "Some people believe that competition for high grades motivates students to excel in the classroom. Others believe that such competition seriously limits the quality of real learning.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 112,
    "accessCode": "ISSUE112",
    "prompt": "Claim: Major policy decisions should always be left to politicians and other government experts.\nReason: Politicians and other government experts are more informed and thus have better judgment and perspective than do members of the general public.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 113,
    "accessCode": "ISSUE113",
    "prompt": "Some people believe that universities should require every student to take a variety of courses outside the student's field of study. Others believe that universities should not force students to take any courses other than those that will help prepare them for jobs in their chosen fields.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 114,
    "accessCode": "ISSUE114",
    "prompt": "It is more harmful to compromise one's own beliefs than to adhere to them.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 115,
    "accessCode": "ISSUE115",
    "prompt": "Claim: Colleges and universities should specify all required courses and eliminate elective courses in order to provide clear guidance for students.\nReason: College students — like people in general — prefer to follow directions rather than make their own decisions.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 116,
    "accessCode": "ISSUE116",
    "prompt": "No field of study can advance significantly unless it incorporates knowledge and experience from outside that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 117,
    "accessCode": "ISSUE117",
    "prompt": "True success can be measured primarily in terms of the goals one sets for oneself.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 118,
    "accessCode": "ISSUE118",
    "prompt": "The general welfare of a nation's people is a better indication of that nation's greatness than are the achievements of its rulers, artists, or scientists.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 119,
    "accessCode": "ISSUE119",
    "prompt": "The best test of an argument is the argument's ability to convince someone with an opposing viewpoint.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 120,
    "accessCode": "ISSUE120",
    "prompt": "The effectiveness of a country's leaders is best measured by examining the well-being of that country's citizens.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 121,
    "accessCode": "ISSUE121",
    "prompt": "Nations should pass laws to preserve any remaining wilderness areas in their natural state.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 122,
    "accessCode": "ISSUE122",
    "prompt": "In any field — business, politics, education, government — those in power should be required to step down after five years.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 123,
    "accessCode": "ISSUE123",
    "prompt": "Some people claim that the goal of politics should be the pursuit of an ideal. Others argue that the goal should be finding common ground and reaching reasonable consensus.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 124,
    "accessCode": "ISSUE124",
    "prompt": "The best way to solve environmental problems caused by consumer-generated waste is for towns and cities to impose strict limits on the amount of trash they will accept from each household.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 125,
    "accessCode": "ISSUE125",
    "prompt": "We learn our most valuable lessons in life from struggling with our limitations rather than from enjoying our successes.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 126,
    "accessCode": "ISSUE126",
    "prompt": "Claim: While boredom is often expressed with a sense of self-satisfaction, it should really be a source of embarrassment.\nReason: Boredom arises from a lack of imagination and self-motivation.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 127,
    "accessCode": "ISSUE127",
    "prompt": "Some people believe that the most important qualities of an effective teacher are understanding and empathy. Others believe that it is more important for teachers to be rigorous and demanding in their expectations for students.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 128,
    "accessCode": "ISSUE128",
    "prompt": "Claim: Though often considered an objective pursuit, learning about the historical past requires creativity.\nReason: Because we can never know the past directly, we must reconstruct it by imaginatively interpreting historical accounts, documents, and artifacts.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which the claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 129,
    "accessCode": "ISSUE129",
    "prompt": "Claim: No act is done purely for the benefit of others.\nReason: All actions — even those that seem to be done for other people — are based on self-interest.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 130,
    "accessCode": "ISSUE130",
    "prompt": "To understand the most important characteristics of a society, one must study its major cities.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 131,
    "accessCode": "ISSUE131",
    "prompt": "Educational institutions have a responsibility to dissuade students from pursuing fields of study in which they are unlikely to succeed.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 132,
    "accessCode": "ISSUE132",
    "prompt": "Scandals are useful because they focus our attention on problems in ways that no speaker or reformer ever could.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 133,
    "accessCode": "ISSUE133",
    "prompt": "Claim: Governments must ensure that their major cities receive the financial support they need in order to thrive.\nReason: It is primarily in cities that a nation's cultural traditions are preserved and generated.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 134,
    "accessCode": "ISSUE134",
    "prompt": "Some people believe that government funding of the arts is necessary to ensure that the arts can flourish and be available to all people. Others believe that government funding of the arts threatens the integrity of the arts.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 135,
    "accessCode": "ISSUE135",
    "prompt": "Claim: In any field — business, politics, education, government — those in power should step down after five years.\nReason: The surest path to success for any enterprise is revitalization through new leadership.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 136,
    "accessCode": "ISSUE136",
    "prompt": "In any field of endeavor, it is impossible to make a significant contribution without first being strongly influenced by past achievements within that field.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 137,
    "accessCode": "ISSUE137",
    "prompt": "Nations should pass laws to preserve any remaining wilderness areas in their natural state, even if these areas could be developed for economic gain.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 138,
    "accessCode": "ISSUE138",
    "prompt": "People's behavior is largely determined by forces not of their own making.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 139,
    "accessCode": "ISSUE139",
    "prompt": "Governments should offer a free university education to any student who has been admitted to a university but who cannot afford the tuition.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 140,
    "accessCode": "ISSUE140",
    "prompt": "Claim: In any situation, the best way to persuade other people is to present them with facts and statistics rather than with emotional arguments.\nReason: Facts are objective, so they are more persuasive than subjective appeals.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 141,
    "accessCode": "ISSUE141",
    "prompt": "Some people believe that success in creative fields, such as painting, fiction writing, and filmmaking, primarily requires hard work and perseverance. Others believe that such success mainly requires innate talents that cannot be learned.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 142,
    "accessCode": "ISSUE142",
    "prompt": "In business, education, and government, it is always appropriate to remain skeptical of new leaders until those leaders show that they are worthy of trust.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 143,
    "accessCode": "ISSUE143",
    "prompt": "Claim: Group assignments that students must work together to complete should replace a substantial amount of traditional lecture-based instruction in college and university courses.\nReason: It is vital for students to gain experience collaborating with peers to study a topic and to achieve a common goal.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 144,
    "accessCode": "ISSUE144",
    "prompt": "Universities should require every student to take a variety of courses outside the student's field of study.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 145,
    "accessCode": "ISSUE145",
    "prompt": "A nation should require all of its students to study the same national curriculum until they enter college.",
    "directions": "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 146,
    "accessCode": "ISSUE146",
    "prompt": "Educational institutions should actively encourage their students to choose fields of study that will prepare them for lucrative careers.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 147,
    "accessCode": "ISSUE147",
    "prompt": "Some people believe that in order to be effective, political leaders must yield to public opinion and abandon principle for the sake of compromise. Others believe that the most essential quality of an effective leader is the ability to remain consistently committed to particular principles and objectives.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 148,
    "accessCode": "ISSUE148",
    "prompt": "Formal education tends to restrain our minds and spirits rather than set them free.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 149,
    "accessCode": "ISSUE149",
    "prompt": "The well-being of a society is enhanced when many of its people question authority.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 150,
    "accessCode": "ISSUE150",
    "prompt": "Governments should focus on solving the immediate problems of today rather than on trying to solve the anticipated problems of the future.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the recommendation and explain your reasoning for the position you take. In developing and supporting your position, describe specific circumstances in which adopting the recommendation would or would not be advantageous and explain how these examples shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 151,
    "accessCode": "ISSUE151",
    "prompt": "Some people believe that college students should consider only their own talents and interests when choosing a field of study. Others believe that college students should base their choice of a field of study on the availability of jobs in that field.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 152,
    "accessCode": "ISSUE152",
    "prompt": "Laws should be flexible enough to take account of various circumstances, times, and places.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 153,
    "accessCode": "ISSUE153",
    "prompt": "Claim: The best way to understand the character of a society is to examine the character of the men and women that the society chooses as its heroes or its role models.\nReason: Heroes and role models reveal a society's highest ideals.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 154,
    "accessCode": "ISSUE154",
    "prompt": "Some people believe that it is helpful to view a challenging situation as an opportunity for personal growth. Others believe that reimagining challenging situations this way occupies too much of the focus one needs to face challenges effectively.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 155,
    "accessCode": "ISSUE155",
    "prompt": "Some people believe that traveling to and living in numerous places increases one's ability to relate and connect to other people. Others believe that this ability is better cultivated by living in one place and developing a deep understanding of that community.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  },
  {
    "id": 156,
    "accessCode": "ISSUE156",
    "prompt": "Claim: Young people's tendency to make extensive use of portable devices like smartphones and tablets has hurt their development of social skills.\nReason: These devices encourage users to form artificial personalities and relationships online rather than fully and honestly engaging with the people around them.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 157,
    "accessCode": "ISSUE157",
    "prompt": "Claim: When one is making a decision, it is better to have a limited number of options.\nReason: The more options a person has, the more difficult it is to make a rational decision.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim and the reason on which that claim is based.",
    "category": "Claim & Reason Task"
  },
  {
    "id": 158,
    "accessCode": "ISSUE158",
    "prompt": "Because people increasingly feel compelled to share their personal details online, the right to privacy is eroding.",
    "directions": "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, be sure to address the most compelling reasons and/or examples that could be used to challenge your position.",
    "category": "Issue Essay Task"
  },
  {
    "id": 159,
    "accessCode": "ISSUE159",
    "prompt": "Some people believe that journalism should make news entertaining to keep the public engaged and informed. Others believe that this practice prioritizes entertainment and undermines the mission of journalism.",
    "directions": "Write a response in which you discuss which view more closely aligns with your own position and explain your reasoning for the position you take. In developing and supporting your position, you should address both of the views presented.",
    "category": "Issue Essay Task"
  }
];
