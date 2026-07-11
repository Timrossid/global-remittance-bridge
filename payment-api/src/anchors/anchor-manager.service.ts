import { Injectable } from '@nestjs/common';
import { CircleAdapter } from '../../../anchor-adapter/src/circle/circle.adapter';
import { IAnchorAdapter } from '../../../anchor-adapter/src/shared/types';

@Injectable()
export class AnchorManagerService {
  private adapters: Map<string, IAnchorAdapter> = new Map();

  constructor() {
    // Register available adapters
    this.adapters.set('CIRCLE', new CircleAdapter());
    // this.adapters.set('MONEYGRAM', new MoneyGramAdapter());
  }

  getAdapter(anchorName: string): IAnchorAdapter {
    const adapter = this.adapters.get(anchorName.toUpperCase());
    if (!adapter) {
      throw new Error(`Anchor adapter for ${anchorName} not supported`);
    }
    return adapter;
  }

  async getBestQuote(fromAsset: string, toAsset: string, amount: number) {
    const quotes = [];
    for (const [name, adapter] of this.adapters) {
      try {
        const quote = await adapter.getQuote(fromAsset, toAsset, amount);
        quotes.push({ anchor: name, ...quote });
      } catch (e) {
        console.error(`Error getting quote from ${name}:`, e);
      }
    }
    return quotes.sort((a, b) => b.toAmount - a.toAmount)[0];
  }
}
