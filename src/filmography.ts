import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { fetch, Response } from "undici";
import { mockedCastings, mockedFilmography } from "./mock-data";
import { flow, pipe } from "fp-ts/lib/function";
import { either as E, taskEither as TE, taskOption as TO } from 'fp-ts';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import { val } from "cheerio/lib/api/attributes";
import { Either } from "fp-ts/lib/Either";
import { r } from "vitest/dist/types-94cfe4b4";

type Movie = {
  title: string;
  url: string;
};

export const retrieveFilmographyFromId = async (alloId: string) => {
  const url = `https://www.allocine.fr/personne/fichepersonne-${alloId}/filmographie/`;
  const response = await fetch(url);
  const rawContent = await response.text();
  const $ = cheerio.load(rawContent);
  const nodes = $("td a");
  const result: Movie[] = getFilmoResult(nodes);
  return result;
};

const toFilmographyUrl = (alloId: string) => `https://www.allocine.fr/personne/fichepersonne-${alloId}/filmographie/`

const fetchFromUrl = (url: string) => TE.tryCatch(() => fetch((url)), () => `can't fetch filmo`)
const getText = (response: Response) => TE.tryCatch(() => response.text(), () => `can't extract document`)

export const retrieveFilmographyFromId2 = async (alloId: string) => {
    return pipe(
        alloId,
        toFilmographyUrl,
        TE.of,
        TE.chain(fetchFromUrl),
        TE.chain(getText),
        TE.map(cheerio.load),
        TE.map((queryFun) => queryFun('td a')),
        TE.map(getFilmoResult),
        TE.foldW((e) => T.of(e), (movies) => T.of(movies))
        )()
};

const toCastingUrl = (movieId: string) => `https://www.allocine.fr/film/fichefilm-${movieId}/casting/`

export const retrieveCastingFromId2 = async (movieId: string) => {
  return pipe(
    movieId,
    toCastingUrl,
    TE.of,
    TE.chain(fetchFromUrl),
    TE.chain(getText),
    TE.map(cheerio.load),
    TE.map((queryFun) => queryFun('a.meta-title-link')),
    TE.map(getCastingResult),
    TE.foldW((e) => T.of(e), (casting) => T.of(casting))
    )()
};

export const retrieveCastingFromId = async (movieId: string) => {
  const url = `https://www.allocine.fr/film/fichefilm-${movieId}/casting/`;
  const response = await fetch(url);
  const rawContent = await response.text();
  const $ = cheerio.load(rawContent);
  const nodes = $("a.meta-title-link");
  const mockCastings = {};
  const result: string[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    result.push(element.attribs.href);
    mockCastings[movieId] = element.attribs.href;
  }
  return result;
};

const doWriteActorDataAsFileWithIdToFolder = (folderPath: string) => (url: string) => (rawContent: string) => {
  writeFileSync(`${folderPath}${url.replace(
        "https://www.allocine.fr/personne/fichepersonne_gen_cpersonne=",
        ""
      )
      .replace(".html", "")}`,
    rawContent
  );
  return rawContent
}

const writeActorDataAsFileWithIdToFolder = doWriteActorDataAsFileWithIdToFolder('./src/actors/')

export const retrieveNameFromActorUrl = async (url: string) => {
  const response = await fetch(url);
  const rawContent = await response.text();
  const $ = cheerio.load(rawContent);
  const nodes = $("div.titlebar-title.titlebar-title-lg");
  return { name: nodes.text() };
};  

export const retrieveNameFromActorUrl2 = async (url: string) => {
  return pipe(
    url,
    TE.of,
    TE.chain(fetchFromUrl),
    TE.chain(getText),
    // TE.map(writeActorDataAsFileWithIdToFolder(url)), // store data to mock
    TE.map(cheerio.load),
    TE.map((queryFun) => queryFun('div.titlebar-title.titlebar-title-lg')),
    TE.map((nodes) => ({ name: nodes.text()})),
    TE.foldW((e) => T.of(({name: e})), (description) => T.of(description))
  )()
};  

const doGetCoCastMembers =
  (
    getFilmo: (alloId: string) => Promise<Movie[]>,
    getCasting: (filmId: string) => Promise<string[]>,
    getName: (alloId: string) => Promise<{ name: string }>
  ) =>
  async (alloId: string) => {
    const filmography = await getFilmo(alloId);
    const filmIds = filmography.map((film) =>
      film.url.replace("/film/fichefilm_gen_cfilm=", "").replace(".html", "")
    );
    const castings = await Promise.all(
      filmIds.map((filmId) => getCasting(filmId))
    );
    const mockCasting = {};
    filmIds.forEach((id: string, index: number) => {
      mockCasting[id] = castings[index];
    });

    const uniqueCastings = [...new Set(castings.flatMap((x) => x))];

    const descriptions = await Promise.all(
      uniqueCastings.map((cast) => getName(`https://www.allocine.fr${cast}`))
    );

    return descriptions.map((description) => description.name);
  };

export const getCoCastMembers = doGetCoCastMembers(
  retrieveFilmographyFromId,
  retrieveCastingFromId,
  retrieveNameFromActorUrl
);

const getFilmoResult = (nodes: cheerio.Cheerio<cheerio.Element>) => {
  const result: Movie[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    result.push({ title: element.attribs.title, url: element.attribs.href });
  }
  return result;
}
const getCastingResult = (nodes: cheerio.Cheerio<cheerio.Element>) => {
  const result: Movie[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    result.push({ title: element.attribs.title, url: element.attribs.href });
  }
  return result;
}
