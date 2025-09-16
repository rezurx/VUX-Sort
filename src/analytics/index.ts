// Analytics utilities for Card Sorting
import { CardSortResult, SimilarityPair, ClusterNode, CategoryFrequency } from '../types';

export class SimilarityAnalysis {
  static calculateCardSimilarity(results: CardSortResult[]): SimilarityPair[] {
    const cardPairs = new Map<string, SimilarityPair>();
    const totalParticipants = results.length;
    
    if (totalParticipants === 0) return [];
    
    // Get all unique cards from first result
    const allCards: { id: number; text: string }[] = [];
    if (results.length > 0) {
      results[0].cardSortResults.forEach(category => {
        category.cards.forEach(card => {
          if (!allCards.find(c => c.id === card.id)) {
            allCards.push(card);
          }
        });
      });
    }
    
    // Calculate co-occurrence for each card pair
    for (let i = 0; i < allCards.length; i++) {
      for (let j = i + 1; j < allCards.length; j++) {
        const card1 = allCards[i];
        const card2 = allCards[j];
        const pairKey = `${Math.min(card1.id, card2.id)}-${Math.max(card1.id, card2.id)}`;
        
        let coOccurrence = 0;
        
        // Count how many participants put these cards in the same category
        results.forEach(result => {
          const foundInSameCategory = result.cardSortResults.some(category => 
            category.cards.some(c => c.id === card1.id) &&
            category.cards.some(c => c.id === card2.id)
          );
          
          if (foundInSameCategory) {
            coOccurrence++;
          }
        });
        
        const similarity = totalParticipants > 0 ? coOccurrence / totalParticipants : 0;
        
        cardPairs.set(pairKey, {
          cardId1: card1.id,
          cardId2: card2.id,
          cardName1: card1.text,
          cardName2: card2.text,
          coOccurrence,
          similarity
        });
      }
    }
    
    return Array.from(cardPairs.values()).sort((a, b) => b.similarity - a.similarity);
  }
  
  static createSimilarityMatrix(results: CardSortResult[]): number[][] {
    const similarities = this.calculateCardSimilarity(results);
    
    // Get all unique cards
    const allCards: { id: number; text: string }[] = [];
    if (results.length > 0) {
      results[0].cardSortResults.forEach(category => {
        category.cards.forEach(card => {
          if (!allCards.find(c => c.id === card.id)) {
            allCards.push(card);
          }
        });
      });
    }
    
    const matrix: number[][] = Array(allCards.length).fill(null).map(() => Array(allCards.length).fill(0));
    
    // Fill diagonal with 1.0 (perfect similarity with self)
    for (let i = 0; i < allCards.length; i++) {
      matrix[i][i] = 1.0;
    }
    
    // Fill matrix with similarity values
    similarities.forEach(sim => {
      const index1 = allCards.findIndex(c => c.id === sim.cardId1);
      const index2 = allCards.findIndex(c => c.id === sim.cardId2);
      
      if (index1 !== -1 && index2 !== -1) {
        matrix[index1][index2] = sim.similarity;
        matrix[index2][index1] = sim.similarity; // Symmetric matrix
      }
    });
    
    return matrix;
  }
}

export class CategoryAnalysis {
  static calculateCategoryFrequency(results: CardSortResult[]): CategoryFrequency[] {
    const categoryMap = new Map<string, CategoryFrequency>();
    const totalParticipants = results.length;
    
    if (totalParticipants === 0) return [];
    
    results.forEach(result => {
      result.cardSortResults.forEach(category => {
        const key = `${category.categoryId}-${category.categoryName}`;
        
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            usage: 0,
            percentage: 0,
            cards: []
          });
        }
        
        const freq = categoryMap.get(key)!;
        freq.usage++;
        
        // Track card frequency in this category
        category.cards.forEach(card => {
          const existingCard = freq.cards.find(c => c.id === card.id);
          if (existingCard) {
            existingCard.frequency++;
          } else {
            freq.cards.push({ ...card, frequency: 1 });
          }
        });
      });
    });
    
    // Calculate percentages
    const frequencies = Array.from(categoryMap.values());
    frequencies.forEach(freq => {
      freq.percentage = (freq.usage / totalParticipants) * 100;
    });
    
    return frequencies.sort((a, b) => b.usage - a.usage);
  }
}

export class HierarchicalClustering {
  static cluster(similarityMatrix: number[][], cardNames: string[]): ClusterNode {
    const n = similarityMatrix.length;
    if (n === 0) return { name: 'Empty', children: [], distance: 0 };
    
    // Convert similarity to distance (1 - similarity)
    const distanceMatrix = similarityMatrix.map(row => 
      row.map(sim => 1 - sim)
    );
    
    // Initialize clusters (each card starts as its own cluster)
    const clusters: ClusterNode[] = cardNames.map((name, i) => ({
      name,
      children: [],
      distance: 0,
      cardIndex: i
    }));
    
    const distances = [...distanceMatrix.map(row => [...row])];
    
    // Merge clusters until only one remains
    while (clusters.length > 1) {
      let minDistance = Infinity;
      let mergeI = 0, mergeJ = 1;
      
      // Find closest pair of clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const dist = this.getClusterDistance(clusters[i], clusters[j], distances);
          if (dist < minDistance) {
            minDistance = dist;
            mergeI = i;
            mergeJ = j;
          }
        }
      }
      
      // Merge the closest clusters
      const newCluster: ClusterNode = {
        name: `Cluster_${clusters.length}`,
        children: [clusters[mergeI], clusters[mergeJ]],
        distance: minDistance,
        size: (clusters[mergeI].size || 1) + (clusters[mergeJ].size || 1)
      };
      
      // Remove merged clusters and add new one
      const newClusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
      newClusters.push(newCluster);
      clusters.splice(0, clusters.length, ...newClusters);
    }
    
    return clusters[0];
  }
  
  private static getClusterDistance(cluster1: ClusterNode, cluster2: ClusterNode, distances: number[][]): number {
    // For simplicity, use average linkage
    if (cluster1.cardIndex !== undefined && cluster2.cardIndex !== undefined) {
      return distances[cluster1.cardIndex][cluster2.cardIndex];
    }
    
    // Calculate average distance between all pairs in the clusters
    const indices1 = this.getLeafIndices(cluster1);
    const indices2 = this.getLeafIndices(cluster2);
    
    let total = 0;
    let count = 0;
    
    indices1.forEach(i => {
      indices2.forEach(j => {
        total += distances[i][j];
        count++;
      });
    });
    
    return count > 0 ? total / count : Infinity;
  }
  
  private static getLeafIndices(cluster: ClusterNode): number[] {
    if (cluster.cardIndex !== undefined) {
      return [cluster.cardIndex];
    }
    
    const indices: number[] = [];
    cluster.children.forEach(child => {
      indices.push(...this.getLeafIndices(child));
    });
    
    return indices;
  }
}

export class PerformanceOptimizer {
  static throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }
  
  static debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return ((...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }
}