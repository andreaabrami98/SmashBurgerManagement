import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  url = 'http://localhost:8080/'


  constructor(private httpClient: HttpClient) { }

  add(data: any) {
    return this.httpClient.post(this.url + 'category/add/', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  update(data: any) {
    return this.httpClient.patch(this.url + 'category/update', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  getCategorys() {
    console.log('getCategorys called');
    return this.httpClient.get(this.url + 'category/get/')
    
  }
 
}



