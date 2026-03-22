export type Source = {
  name: string;
  url: string;
  type: "rss" | "api";
};

export const SOURCES: Source[] = [
  { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml", type: "rss" },
  { name: "Google AI Blog", url: "https://feeds.feedburner.com/blogspot/gJZg", type: "rss" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/tag/ai/feed/", type: "rss" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", type: "rss" },
  { name: "Wired AI", url: "https://www.wired.com/tag/artificial-intelligence/rss", type: "rss" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/feed/", type: "rss" },
  { name: "The Verge AI", url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", type: "rss" },
  { name: "Meta AI Blog", url: "https://ai.facebook.com/blog/rss", type: "rss" },
  { name: "Anthropic Blog", url: "https://www.anthropic.com/index.xml", type: "rss" },
  { name: "DeepMind Blog", url: "https://deepmind.com/blog/feed/basic/", type: "rss" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", type: "rss" },
  { name: "Stability AI Blog", url: "https://stability.ai/blog?format=rss", type: "rss" },
  { name: "Microsoft AI Blog", url: "https://blogs.microsoft.com/ai/feed/", type: "rss" },
  { name: "arXiv AI", url: "http://export.arxiv.org/rss/cs.AI", type: "rss" },
  { name: "arXiv CL", url: "http://export.arxiv.org/rss/cs.CL", type: "rss" },
  { name: "arXiv LG", url: "http://export.arxiv.org/rss/cs.LG", type: "rss" },
  { name: "PapersWithCode", url: "https://paperswithcode.com/rss/", type: "rss" },
  { name: "Reddit MachineLearning", url: "https://www.reddit.com/r/MachineLearning/.rss", type: "rss" },
  { name: "Product Hunt AI", url: "https://www.producthunt.com/feed?category=artificial-intelligence", type: "rss" },
  { name: "Hacker News AI", url: "https://hnrss.org/frontpage?q=AI", type: "rss" },
  { name: "YC Blog AI", url: "https://blog.ycombinator.com/tag/ai/feed/", type: "rss" },
];
