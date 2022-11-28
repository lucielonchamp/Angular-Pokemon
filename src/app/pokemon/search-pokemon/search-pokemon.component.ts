import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { Pokemon } from '../pokemon';
import { PokemonService } from '../pokemon.service';

@Component({
  selector: 'app-search-pokemon',
  templateUrl: './search-pokemon.component.html',
  styleUrls: ['./search-pokemon.component.scss'],
})
export class SearchPokemonComponent implements OnInit {
  // permet de construire un flux de données, pas seulement pour le consommer mais piloter l'observable. A partir des données qui arrivent, on affiche les résultats saisis par le User.
  searchTerms = new Subject<string>();
  // le $ est une convention pour nommer une variable contenant un flux de données.
  pokemons$: Observable<Pokemon[]>;

  constructor(private router: Router, private pokemonService: PokemonService) {}

  ngOnInit(): void {
    // dans le template le pipe async permet de faire la même chose. Angular va faire l'opération directement en interne dans le template de manière beaucoup plus courte.
    // this.pokemons$.subscribe(pokemons => this.pokemons = pokemons);
    this.pokemons$ = this.searchTerms.pipe(
      // permet d'attendre un certain temps avant de faire des appels aux serveurs pour éviter de le surcharger. Elmimine des requêtes non nécessaires.
      // méthode qui permet d'attendre qu'il y est un changement dans les termes de recherche pour faire un requête.

      // {..."a".."ab"..."abz"... "ab"..."abc"} Exemple de recherche du User : search term représente un flux de données dans le temps avec les recherches du User.
      debounceTime(300),
      // {....."ab"......"ab"..."abc"}
      distinctUntilChanged(),
      // {....."ab"........."abc"}
      switchMap((term) => this.pokemonService.searchPokemonList(term))
      // si on utilise map() {.....Observable<"ab">............Observable<"abc">......}
      // concatMap / mergeMap / switchMap
      // plusieurs méthodes son disponible mais le switchMap est favorable car il récupére le dernier changement
      // Si on utilise switchMap {.....pokemonList(ab)............pokemonList(abc)......}
    );
  }
  search(term: string) {
    // la méthode next ressemble à la méthode push dans les tableaux mais avec un flux de données (fonctionne de la même manière)
    this.searchTerms.next(term);
  }
  goToDetail(pokemon: Pokemon) {
    const link = ['/pokemon', pokemon.id];
    this.router.navigate(link);
  }
}
