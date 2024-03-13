import axios from "axios";
import { useInfiniteQuery, useQuery } from "react-query";

const HEADERS = {
  accept: "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhOWNjMTU4NmE5ODMwN2VlZTk1ZWYxYWFjOTExNDU0NiIsInN1YiI6IjY0NmU5ODc3ZWEzOTQ5MDBhN2NmY2I1NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7X61NhwhmlAW54YCm34BeCfSvWHOu-cZDA0m6UO77cA",
};

export interface MovieDetail {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MovieList {
  page: number;
  results: MovieDetail[];
  total_pages: number;
  total_results: number;
}

export interface VideoDetail {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideoList {
  id: number;
  results: VideoDetail[];
}

const fetchMovie = async ({
  type,
  pageParam,
}: {
  pageParam: number;
  type: string;
}) => {
  const { data } = await axios.get(
    `https://api.themoviedb.org/3/movie/${type}?language=en-US&page=${pageParam}`,
    {
      headers: HEADERS,
    }
  );
  return data;
};

const fetcSearchMovie = async ({
  search,
  pageParam,
}: {
  pageParam: number;
  search: string;
}) => {
  const { data } = await axios.get(
    `https://api.themoviedb.org/3/search/movie?query=${search}&include_adult=false&language=en-US&page=${pageParam}`,
    {
      headers: HEADERS,
    }
  );
  return data;
};

export const usePopularMovies = (search: string) => {
  return useInfiniteQuery<MovieList>({
    queryKey: ["popular_movie"],
    queryFn: ({ pageParam = 1 }) => fetchMovie({ type: "popular", pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page !== lastPage.total_pages ? lastPage.page + 1 : null,
    enabled: !search,
  });
};

export const useTopMovies = (search: string) => {
  return useInfiniteQuery<MovieList>({
    queryKey: ["top_rated_movie"],
    queryFn: ({ pageParam = 1 }) =>
      fetchMovie({ type: "top_rated", pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page !== lastPage.total_pages ? lastPage.page + 1 : null,
    enabled: !search,
  });
};

export const useNowPlayingMovies = (search: string) => {
  return useQuery(
    ["now_playing_movie", search],
    async (): Promise<MovieList> => {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${1}`,
        {
          headers: HEADERS,
        }
      );
      return data;
    },
    {
      enabled: !search,
    }
  );
};

export const useSearchMovies = (search: string) => {
  return useInfiniteQuery<MovieList>({
    queryKey: ["search_movie", search],
    queryFn: ({ pageParam = 1 }) =>
      fetcSearchMovie({ search: search, pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page !== lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!search,
  });
};

export const useGetVideo = (movie_id: number) => {
  return useQuery(
    ["movie_videos", movie_id],
    async (): Promise<VideoList> => {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie_id}/videos`,
        {
          headers: HEADERS,
        }
      );
      return data;
    },
    {
      enabled: !!movie_id,
    }
  );
};
