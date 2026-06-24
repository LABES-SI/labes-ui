import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { GLOSSARIO_TERMOS } from '../data/glossario';
import { TermoGlossario } from '../models/glossario.models';

@Injectable({ providedIn: 'root' })
export class GlossarioFacade {
  listarTodos(): Observable<readonly TermoGlossario[]> {
    return of(GLOSSARIO_TERMOS);
  }
}
