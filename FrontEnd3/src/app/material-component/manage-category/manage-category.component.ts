import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SnackbarService } from '../../services/snackbar.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConstants } from '../../shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrl: './manage-category.component.scss'
})
export class ManageCategoryComponent implements OnInit{

  displayedColumns: string[] = ['name','edit'];
  dataSource: any;
  responseMessage:any;

  constructor(private categoryService:CategoryService,
    private ngxService:NgxUiLoaderService,
    private dialog:MatDialog,
    private snackbarService:SnackbarService,
    private router:Router) { }

  ngOnInit(): void{
    this.ngxService.start();
    this.tableData();
    

 }
  tableData() {
    this.categoryService.getCategorys().subscribe((response:any) => {
      
      this.ngxService.stop();
      console.log(response); // Add this line
      
      this.dataSource = new MatTableDataSource(response);
    }, (error:any) => {
      this.ngxService.stop();
      console.log(error); // Add this line
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = "Something went wrong";
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
      
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleAddAction(){
    const dialogConfig= new MatDialogConfig();
    dialogConfig.data = {
      action:"Add"
    };
    dialogConfig.width="850px";
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
  
    const sub = dialogRef.componentInstance.onAddCategory.subscribe((response) => { // Fix syntax here
      this.tableData();
    }); 
  }

  handleEditAction(element: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: "Edit",
      data: element
    };
    dialogConfig.width = "850px";
    const dialogRef = this.dialog.open(CategoryComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
  
    dialogRef.componentInstance.onEditCategory.subscribe(() => {
      dialogRef.close(); // Close the dialog after category is edited
      this.tableData(); // Reload table data after category is edited
    });
  }
}
