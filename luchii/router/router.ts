import type { GovernanceHooks } from "./governance.js";
import type { ProviderRegistry } from "./providers.js";
import type {
  ChatRequest,
  ChatResponse,
  EmbeddingsRequest,
  EmbeddingsResponse,
  ModelConfig,
} from "./types.js";

interface RoutingSelectors {
  tenant?: string;
  domain?: string;
  region?: string;
}

export interface RoutingRule extends RoutingSelectors {
  id: string;
  model: ModelConfig;
}

export interface RouterConfig {
  schemaVersion: string;
  rules: RoutingRule[];
}

interface RankedRule {
  index: number;
  rule: RoutingRule;
  specificity: number;
}

export class Router {
  constructor(
    private readonly config: RouterConfig,
    private readonly providers: ProviderRegistry,
    private readonly governanceHooks: GovernanceHooks = {},
  ) {}

  resolveRule(selectors: RoutingSelectors): RoutingRule {
    const matches = this.config.rules
      .map((rule, index): RankedRule | undefined => {
        if (!this.matchesRule(rule, selectors)) {
          return undefined;
        }

        return {
          index,
          rule,
          specificity: this.getSpecificity(rule),
        };
      })
      .filter((entry): entry is RankedRule => entry !== undefined)
      .sort((left, right) => right.specificity - left.specificity || left.index - right.index);

    const bestMatch = matches[0]?.rule;

    if (!bestMatch) {
      throw new Error(
        `No applicable routing rule for tenant='${selectors.tenant ?? "*"}', domain='${selectors.domain ?? "*"}', region='${selectors.region ?? "*"}'.`,
      );
    }

    return bestMatch;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const rule = this.resolveRule(request);
    const provider = this.providers.require(rule.model.providerId);
    const governedRequest = this.governanceHooks.beforeChat
      ? await this.governanceHooks.beforeChat(request, rule.model)
      : request;
    const response = await provider.chat(governedRequest, rule.model);

    return this.governanceHooks.afterChat
      ? this.governanceHooks.afterChat(response, governedRequest, rule.model)
      : response;
  }

  async embeddings(request: EmbeddingsRequest): Promise<EmbeddingsResponse> {
    const rule = this.resolveRule(request);
    const provider = this.providers.require(rule.model.providerId);
    const governedRequest = this.governanceHooks.beforeEmbeddings
      ? await this.governanceHooks.beforeEmbeddings(request, rule.model)
      : request;
    const response = await provider.embeddings(governedRequest, rule.model);

    return this.governanceHooks.afterEmbeddings
      ? this.governanceHooks.afterEmbeddings(response, governedRequest, rule.model)
      : response;
  }

  private matchesRule(rule: RoutingRule, selectors: RoutingSelectors): boolean {
    return this.selectorMatches(rule.tenant, selectors.tenant)
      && this.selectorMatches(rule.domain, selectors.domain)
      && this.selectorMatches(rule.region, selectors.region);
  }

  private selectorMatches(ruleValue: string | undefined, requestValue: string | undefined): boolean {
    return ruleValue === undefined || ruleValue === requestValue;
  }

  private getSpecificity(rule: RoutingRule): number {
    return [rule.tenant, rule.domain, rule.region].filter((value) => value !== undefined).length;
  }
}
