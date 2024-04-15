import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardService } from '../services/dashboard.service';
import { SnackbarService } from '../services/snackbar.service';
import { GlobalConstants } from '../shared/global-constants';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

	responseMessage: any;
	data: any = {};	

	ngAfterViewInit() { }

	constructor(private dashboardService: DashboardService,
		private snackBar: SnackbarService,
		private ngxService: NgxUiLoaderService) {
			this.ngxService.start();
			this.dashboardData();
	}

	dashboardData() {
		this.dashboardService.getDetails().subscribe((response: any) => {
			this.ngxService.stop();
			console.log(response);
			this.data = response;
		},
		(error: any) => { 
			this.ngxService.stop();
			console.log(error);
			if (error.error?.message){
				this.responseMessage = error.error?.message;
			}
			else{
				this.responseMessage = GlobalConstants.genericError;
			}
			this.snackBar.openSnackBar(this.responseMessage, GlobalConstants.error);

		});
	}
}	
