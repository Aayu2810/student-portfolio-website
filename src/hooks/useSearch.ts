import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SearchableDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  content?: string;
  tags?: string[];
  uploadedAt: Date;
  size: number;
  folderId?: string;
  folderName?: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface SearchFilters {
  category?: string[];
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  fileType?: string[];
  minSize?: number;
  maxSize?: number;
}

export interface SearchResult extends SearchableDocument {
  relevanceScore: number;
  matchedFields: string[];
  highlightedName?: string;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  filters: SearchFilters;
  totalResults: number;
  searchHistory: string[];
}

export const useSearch = (documents: SearchableDocument[] = []) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false,
    error: null,
    filters: {},
    totalResults: 0,
    searchHistory: [],
  });

  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        setState((prev) => ({
          ...prev,
          searchHistory: JSON.parse(savedHistory).slice(0, 10),
        }));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setState((prev) => {
      const newHistory = [
        query,
        ...prev.searchHistory.filter((q) => q !== query),
      ].slice(0, 10);

      try {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return { ...prev, searchHistory: newHistory };
    });
  }, []);

  // Calculate relevance score
  const calculateRelevance = useCallback(
    (doc: SearchableDocument, query: string): { score: number; matchedFields: string[] } => {
      const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
      let score = 0;
      const matchedFields: string[] = [];

      searchTerms.forEach((term) => {
        // Exact name match (highest priority)
        if (doc.name.toLowerCase() === term) {
          score += 100;
          matchedFields.push('name');
        }
        // Name contains term
        else if (doc.name.toLowerCase().includes(term)) {
          score += 50;
          matchedFields.push('name');
        }

        // Category match
        if (doc.category.toLowerCase().includes(term)) {
          score += 30;
          matchedFields.push('category');
        }

        // Type match
        if (doc.type.toLowerCase().includes(term)) {
          score += 20;
          matchedFields.push('type');
        }

        // Tags match
        if (doc.tags?.some((tag) => tag.toLowerCase().includes(term))) {
          score += 25;
          matchedFields.push('tags');
        }

        // Content match (if available)
        if (doc.content?.toLowerCase().includes(term)) {
          score += 15;
          matchedFields.push('content');
        }

        // Folder name match
        if (doc.folderName?.toLowerCase().includes(term)) {
          score += 10;
          matchedFields.push('folder');
        }
      });

      // Boost for verified documents
      if (doc.status === 'verified') {
        score += 5;
      }

      return { score, matchedFields: Array.from(new Set(matchedFields)) };
    },
    []
  );

  // Apply filters to documents
  const applyFilters = useCallback(
    (docs: SearchResult[], filters: SearchFilters): SearchResult[] => {
      let filtered = [...docs];

      // Filter by category
      if (filters.category && filters.category.length > 0) {
        filtered = filtered.filter((doc) => filters.category!.includes(doc.category));
      }

      // Filter by status
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter((doc) => filters.status!.includes(doc.status));
      }

      // Filter by file type
      if (filters.fileType && filters.fileType.length > 0) {
        filtered = filtered.filter((doc) =>
          filters.fileType!.some((type) => doc.type.toLowerCase().includes(type.toLowerCase()))
        );
      }

      // Filter by date range
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;

        if (start) {
          filtered = filtered.filter((doc) => doc.uploadedAt >= start);
        }

        if (end) {
          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);
          filtered = filtered.filter((doc) => doc.uploadedAt <= endOfDay);
        }
      }

      // Filter by file size
      if (filters.minSize !== undefined) {
        filtered = filtered.filter((doc) => doc.size >= filters.minSize!);
      }

      if (filters.maxSize !== undefined) {
        filtered = filtered.filter((doc) => doc.size <= filters.maxSize!);
      }

      return filtered;
    },
    []
  );

  // Highlight matching terms in text
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;

    const terms = query.toLowerCase().split(' ').filter(Boolean);
    let highlighted = text;

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });

    return highlighted;
  }, []);

  // Perform search
  const search = useCallback(
    (query: string, filters: SearchFilters = {}) => {
      setState((prev) => ({ ...prev, isSearching: true, error: null, query }));

      try {
        if (!query.trim()) {
          setState((prev) => ({
            ...prev,
            results: [],
            totalResults: 0,
            isSearching: false,
          }));
          return;
        }

        // Calculate relevance for all documents
        const scoredResults: SearchResult[] = documents
          .map((doc) => {
            const { score, matchedFields } = calculateRelevance(doc, query);
            return {
              ...doc,
              relevanceScore: score,
              matchedFields,
              highlightedName: highlightText(doc.name, query),
            };
          })
          .filter((result) => result.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Apply filters
        const filteredResults = applyFilters(scoredResults, filters);

        setState((prev) => ({
          ...prev,
          results: filteredResults,
          totalResults: filteredResults.length,
          filters,
          isSearching: false,
        }));

        // Save to history
        saveToHistory(query);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Search failed',
          isSearching: false,
        }));
      }
    },
    [documents, calculateRelevance, applyFilters, highlightText, saveToHistory]
  );

  // Update search query
  const setQuery = useCallback(
    (query: string) => {
      search(query, state.filters);
    },
    [search, state.filters]
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      search(state.query, updatedFilters);
    },
    [state.filters, state.query, search]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    search(state.query, {});
  }, [state.query, search]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      query: '',
      results: [],
      totalResults: 0,
      filters: {},
    }));
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem('searchHistory');
      setState((prev) => ({ ...prev, searchHistory: [] }));
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  // Get suggestions based on query
  const getSuggestions = useCallback(
    (query: string, limit: number = 5): string[] => {
      if (!query.trim()) return state.searchHistory.slice(0, limit);

      const queryLower = query.toLowerCase();
      const suggestions = new Set<string>();

      // Add matching document names
      documents.forEach((doc) => {
        if (doc.name.toLowerCase().includes(queryLower)) {
          suggestions.add(doc.name);
        }
      });

      // Add matching categories
      documents.forEach((doc) => {
        if (doc.category.toLowerCase().includes(queryLower)) {
          suggestions.add(doc.category);
        }
      });

      // Add matching tags
      documents.forEach((doc) => {
        doc.tags?.forEach((tag) => {
          if (tag.toLowerCase().includes(queryLower)) {
            suggestions.add(tag);
          }
        });
      });

      return Array.from(suggestions).slice(0, limit);
    },
    [documents, state.searchHistory]
  );

  // Get popular searches
  const getPopularSearches = useMemo(() => {
    return state.searchHistory.slice(0, 5);
  }, [state.searchHistory]);

  // Search by category
  const searchByCategory = useCallback(
    (category: string) => {
      updateFilters({ category: [category] });
    },
    [updateFilters]
  );

  // Search by status
  const searchByStatus = useCallback(
    (status: string) => {
      updateFilters({ status: [status] });
    },
    [updateFilters]
  );

  return {
    query: state.query,
    results: state.results,
    isSearching: state.isSearching,
    error: state.error,
    filters: state.filters,
    totalResults: state.totalResults,
    searchHistory: state.searchHistory,
    search,
    setQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    clearHistory,
    getSuggestions,
    getPopularSearches,
    searchByCategory,
    searchByStatus,
  };
};