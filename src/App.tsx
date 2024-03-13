import { Title, Input, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { debounce, filterDuplicate } from "./util";
import {
  MovieDetail,
  useGetVideo,
  useNowPlayingMovies,
  usePopularMovies,
  useSearchMovies,
  useTopMovies,
} from "./api/query";
import LoadingSpinner from "./components/LoadingSpinner";
import ListMovie from "./components/ListMovie";
import ListSearchMovie from "./components/ListSearchMovie";
import { QueryClient } from "react-query";
import ListNowPlaying from "./components/ListNowPlaying";
import { modals } from "@mantine/modals";

const App = ({ queryClient }: { queryClient: QueryClient }) => {
  const [search, setSearch] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | undefined>();
  const idMovie = useMemo(() => selectedMovie?.id ?? 0, [selectedMovie]);
  const handleModal = (item: MovieDetail) => {
    setSelectedMovie(item);
  };
  const { data: movieVideoData, isFetching: isFetchingMovieVideo } =
    useGetVideo(idMovie);
  const { data: nowPlayingData, isFetching: isFetchingNowPlaying } =
    useNowPlayingMovies(search);

  useEffect(() => {
    if (movieVideoData?.id && selectedMovie?.id) {
      const dataVideo = movieVideoData.results[0] || {};
      const embedId =
        (dataVideo?.site ?? "").toLowerCase() === "youtube"
          ? `https://www.youtube.com/embed/${dataVideo.key}`
          : `https://vimeo.com/${dataVideo.key}`;
      modals.open({
        size: "xl",
        radius: "md",
        children: (
          <div className="flex flex-col w-full gap-4">
            <div className="overflow-hidden pb-[56.25%] relative h-0">
              <iframe
                width="853"
                height="480"
                src={embedId}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded Trailer"
                className="top-0 left-0 h-full w-full absolute"
              />
            </div>
            <div className="flex flex-col gap-4 px-4 w-full h-full">
              <Title order={6}>{selectedMovie.title}</Title>
              <Text fz="md" lh="md">
                {selectedMovie.overview}
              </Text>
            </div>
          </div>
        ),
        onClose: () => {
          setSelectedMovie(undefined);
        },
      });
    }
  }, [movieVideoData, modals, selectedMovie]);

  const {
    data: topMovies,
    fetchNextPage: fetchNextPageTopMovie,
    hasNextPage: hasNextPageTopMovie,
    isFetching: isFetchingTopMovie,
    isFetchingNextPage: isFetchingNextPageTopMovie,
  } = useTopMovies(search);
  const dataTopMovie = useMemo(
    () =>
      (topMovies?.pages ?? []).reduce(
        (prev, next) => filterDuplicate([...prev, ...next.results]),
        [] as MovieDetail[]
      ),
    [topMovies]
  );

  const {
    data: popularMovies,
    fetchNextPage: fetchNextPagePopularMovie,
    hasNextPage: hasNextPagePopularMovie,
    isFetching: isFetchingPopularMovie,
    isFetchingNextPage: isFetchingNextPagePopularMovie,
  } = usePopularMovies(search);
  const dataPopularMovie = useMemo(
    () =>
      (popularMovies?.pages ?? []).reduce(
        (prev, next) => filterDuplicate([...prev, ...next.results]),
        [] as MovieDetail[]
      ),
    [popularMovies]
  );

  const {
    data: searchMovies,
    fetchNextPage: fetchNextPageSearchMovie,
    hasNextPage: hasNextPageSearchMovie,
    isFetching: isFetchingSearchMovie,
    isFetchingNextPage: isFetchingNextPageSearchMovie,
  } = useSearchMovies(search);
  const dataSearchMovie = useMemo(
    () =>
      (searchMovies?.pages ?? []).reduce(
        (prev, next) => filterDuplicate([...prev, ...next.results]),
        [] as MovieDetail[]
      ),
    [searchMovies]
  );

  const isLoading = useMemo(
    () =>
      isFetchingNextPagePopularMovie ||
      isFetchingNextPageTopMovie ||
      isFetchingNextPageSearchMovie ||
      isFetchingPopularMovie ||
      isFetchingTopMovie ||
      isFetchingSearchMovie ||
      isFetchingNowPlaying ||
      isFetchingMovieVideo,
    [
      isFetchingNextPagePopularMovie,
      isFetchingNextPageTopMovie,
      isFetchingNextPageSearchMovie,
      isFetchingPopularMovie,
      isFetchingTopMovie,
      isFetchingSearchMovie,
      isFetchingNowPlaying,
      isFetchingMovieVideo,
    ]
  );

  const handleSearch = debounce((tempSearch: string) => {
    queryClient.setQueryData("search_movie", 0);
    setSearch(tempSearch);
  }, 500);

  return (
    <div className="min-h-screen bg-[#495057]">
      <header className="sticky top-0 p-4 z-10 bg-[#212529] text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Title order={3} className="!text-white">
              Netplix
            </Title>
            <div className="flex gap-4">
              <Text size="md" lh={"md"}>
                Movie
              </Text>
              <Text size="md" lh={"md"}>
                Search
              </Text>
              <Text size="md" lh={"md"}>
                Genre
              </Text>
            </div>
          </div>
          <div className="relative flex w-72 md:w-48">
            <Input
              radius="md"
              placeholder={"Search"}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </header>
      <div className="container mx-auto">
        <div className="flex flex-col py-4 gap-8 w-full">
          {search && dataSearchMovie.length > 0 ? (
            <ListSearchMovie
              dataList={dataSearchMovie}
              title="Search"
              fetchNextPage={fetchNextPageSearchMovie}
              hasNextPage={hasNextPageSearchMovie}
              handleModal={handleModal}
            />
          ) : null}
          {!search ? (
            <ListNowPlaying
              listData={nowPlayingData?.results ?? []}
              handleModal={handleModal}
            />
          ) : null}
          {!search && dataPopularMovie.length > 0 ? (
            <ListMovie
              key={"popular"}
              dataList={dataPopularMovie}
              title="Popular"
              fetchNextPage={fetchNextPagePopularMovie}
              hasNextPage={hasNextPagePopularMovie}
              handleModal={handleModal}
            />
          ) : null}
          {!search && dataTopMovie.length > 0 ? (
            <ListMovie
              key={"top-rated"}
              dataList={dataTopMovie}
              title="Top Rated"
              fetchNextPage={fetchNextPageTopMovie}
              hasNextPage={hasNextPageTopMovie}
              handleModal={handleModal}
            />
          ) : null}
        </div>
      </div>
      {isLoading ? <LoadingSpinner /> : null}
    </div>
  );
};

export default App;
