//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const get_search_query_documentEval: EvalFunction = {
    name: 'get_search_query_documentEval',
    description: 'Evaluates retrieval of comprehensive esa.io search query documentation',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please provide the comprehensive documentation about esa.io search queries, including all available syntax, operators, and parameters to effectively search through esa posts.");
        return JSON.parse(result);
    }
};

const search_esa_postsEval: EvalFunction = {
    name: 'search_esa_postsEval',
    description: 'Evaluates the correct usage and results of searching posts in esa.io',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Search ESA.io posts for 'typescript' in the title that have more than 3 stars. Return the first page of results.");
        return JSON.parse(result);
    }
};

const read_esa_post: EvalFunction = {
    name: "read_esa_post Evaluation",
    description: "Evaluates reading a post from esa.io",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please read post number 10 from the 'example-team' in esa.io");
        return JSON.parse(result);
    }
};

const read_esa_multiple_postsEval: EvalFunction = {
    name: "read_esa_multiple_posts Tool Evaluation",
    description: "Tests the tool to read multiple posts from esa.io",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please read posts #20 and #25 from the team 'myTeam' on esa.io using the read_esa_multiple_posts tool and provide a summary.");
        return JSON.parse(result);
    }
};

const create_esa_postEval: EvalFunction = {
    name: "create_esa_post Evaluation",
    description: "Evaluates the creation of a new post in esa.io",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please create an esa post titled 'Tool Test Post' with a body 'This is a test post body' and tags 'eval, tool' using the create_esa_post tool.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [get_search_query_documentEval, search_esa_postsEval, read_esa_post, read_esa_multiple_postsEval, create_esa_postEval]
};
  
export default config;
  
export const evals = [get_search_query_documentEval, search_esa_postsEval, read_esa_post, read_esa_multiple_postsEval, create_esa_postEval];