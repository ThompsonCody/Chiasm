export interface StructureCatalogueState {
  status: 'mapped' | 'citation-only';
  search: string;
  work: string;
  source: string;
  scope: string;
  pattern: string;
  page: number;
}

export const defaultCatalogue: StructureCatalogueState = {
  status: 'mapped', search: '', work: '', source: '', scope: '', pattern: '', page: 0,
};

export function catalogueFromParams(params: URLSearchParams): StructureCatalogueState {
  const page = Number(params.get('results-page') ?? 0);
  return {
    status: params.get('records') === 'citation-only' ? 'citation-only' : 'mapped',
    search: params.get('q') ?? '', work: params.get('book') ?? '', source: params.get('source') ?? '',
    scope: ['single', 'multiple'].includes(params.get('scope') ?? '') ? params.get('scope')! : '',
    pattern: ['chiastic', 'other'].includes(params.get('pattern') ?? '') ? params.get('pattern')! : '',
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
  };
}
