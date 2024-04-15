import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';
import { ActivatedRouteSnapshot} from '@angular/router';
import { GlobalConstants } from '../shared/global-constants';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(public auth:AuthService,
    public router:Router,
    private snackBar:SnackbarService ) { }

    canActivate(route:ActivatedRouteSnapshot):boolean{
      let expectedRoleArray = route.data;
      expectedRoleArray = expectedRoleArray.expectedRole;

      const token:any = localStorage.getItem('token');
      var tokenPayload:any;
    try{
      tokenPayload = jwtDecode(token);
    }
    catch(Error){
      localStorage.clear();
      this.router.navigate(['/']);
    }

    let checkRole = false;

    for(let i=0; i<expectedRoleArray.length; i++){
      if(expectedRoleArray[i] === tokenPayload.role){
        checkRole = true;
      }
    }

    if(tokenPayload.role == 'user' || tokenPayload.role == 'admin'){
      if(this.auth.isAuthenticated() && checkRole){
        return true;
      
    }
    this.snackBar.openSnackBar(GlobalConstants.unAuthorized, GlobalConstants.error);
    this.router.navigate(['/cafe/dashboard']);
    return false;
    }

    else{
      this.router.navigate(['/']);
      localStorage.clear();
      return false;
    }


}
}
