"use client"

import { useEffect } from "react"

import { useState } from "react"

// Optimized fetch utilities for better performance
export class FetchOptimizer {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private static pendingRequests = new Map<string, Promise<any>>()

  static async optimizedFetch<T>(
    url: string,
    options: RequestInit & {
      ttl?: number
      retries?: number
      timeout?: number
      cacheKey?: string
    } = {},
  ): Promise<T> {
    const {
      ttl = 300000, // 5 minutes default TTL
      retries = 3,
      timeout = 10000, // 10 seconds timeout
      cacheKey = url,
      ...fetchOptions
    } = options

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!
    }

    // Create new request with timeout and retries
    const requestPromise = this.executeWithRetries(url, fetchOptions, retries, timeout)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()

        // Cache successful response
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        })

        return data
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey)
      })

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }

  private static async executeWithRetries(
    url: string,
    options: RequestInit,
    retries: number,
    timeout: number,
  ): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response
      } catch (error) {
        if (i === retries) throw error

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }

    throw new Error("Max retries exceeded")
  }

  static clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  static preload(urls: string[], options: RequestInit = {}) {
    return Promise.allSettled(urls.map((url) => this.optimizedFetch(url, options)))
  }
}

// React hook for optimized data fetching
export function useOptimizedFetch<T>(
  url: string | null,
  options: Parameters<typeof FetchOptimizer.optimizedFetch>[1] = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return

    setLoading(true)
    setError(null)

    FetchOptimizer.optimizedFetch<T>(url, options)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (url) {
        FetchOptimizer.clearCache(url)
        setLoading(true)
        FetchOptimizer.optimizedFetch<T>(url, options)
          .then(setData)
          .catch(setError)
          .finally(() => setLoading(false))
      }
    },
  }
}
