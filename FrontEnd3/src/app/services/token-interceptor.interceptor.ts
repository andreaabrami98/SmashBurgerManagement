import { Injectable } from "@angular/core";
import { 
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent, 
  HttpErrorResponse} from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { Router } from "@angular/router";
import { throwError } from 'rxjs';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {

  constructor(private router:Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    if(token){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if(err instanceof HttpErrorResponse){
          console.log(err.url);
          if(err.status===401 || err.status===403){
            if(this.router.url === '/'){
              this.router.navigate(['/']);
            }
            else{
              localStorage.clear();
              this.router.navigate(['/']);
            }
          }
        }
        return throwError(err);
      })
    );
  }
}
