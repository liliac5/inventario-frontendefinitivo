import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BienesService {

  private apiUrl = 'http://localhost:8080/api/bienes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  create(bien: any): Observable<any> {
    return this.http.post(this.apiUrl, bien, {
      headers: this.getHeaders()
    });
  }

  update(id: number, bien: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bien, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
 getParaEditar(id: number) {
  return this.http.get<any>(`${this.apiUrl}/editar/${id}`, {
    headers: this.getHeaders()
  });
}


}
