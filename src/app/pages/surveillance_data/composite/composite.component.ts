import {Component, OnInit} from '@angular/core';
import {AwarenessService} from "../../../services/awareness.service";
import {Surveillance} from "../../../models/Surveillance.model";
import {CommunicationService} from "../../../services/communication.service";
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../../../services/api/api.service";
import {ApiResponse, ApiResponseStatus} from "../../../interfaces/IAuth.model";
import {ResourceModelApi} from "../../../models/Resource.model";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../services/authentication.service";

@Component({
  selector: 'app-composites',
  templateUrl: './composite.component.html'
})
export class CompositeComponent implements OnInit{
  Surveillance: Surveillance[] = [];
  TableHeaders: string[] = [ "original_filename", "state", "type", "validated", "created_at", "actions"];
  fileStates: string[] = [ "Pending Processing", "Validating", "Rejected", "Processing", "Validated"];

  FilterSurveillanceData: Surveillance = new Surveillance();
  ResourceModel: ResourceModelApi[] = [];
  userRole: string;

  ApiResponseStatus: ApiResponseStatus = {
    success: null,
    result: null,
    processing: false,
    message: ""
  }

  constructor(private awareness: AwarenessService, private communication: CommunicationService,
              private apiService: ApiService, private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.authenticationService.getApiCurrentUserRole().subscribe({
      next: (role) => {
        this.userRole = role;
        console.log('ngOnInit userRole', this.userRole);
      },
      error: (err) => console.error('Error fetching user role', err),
    });
    console.log('surveillance', this.authenticationService.getApiCurrentUserRole());
    this.loadComposites();
  }

  getUSerRole(){

  }
  loadComposites(){
    this.ApiResponseStatus.processing = true;
    const userData = this.awareness.getUserData();
    if(!userData){
      this.router.navigate(['/authentication/login'])
    }else{
      const url = `files/uploads/?user_id=${userData.id}`;
      this.apiService.get(url).subscribe({
        next: (res) => {
          this.ApiResponseStatus.success = true;
          this.ResourceModel = res.data.map(item => item.attributes);

        },
        error: (error) =>{
        },
        complete: () =>{
          this.ApiResponseStatus.processing = false;
        },
      });
    }

  }

  loadComposite() {
    this.FilterSurveillanceData.user_id = this.awareness.UserInstance.id;
    this.FilterSurveillanceData.acquireComposite((Surveillance: Surveillance[]) => {
      this.Surveillance = Surveillance;
      console.log("Allll", this.Surveillance);
    }, (error: any) => {
      // TODO! Handle errors
      console.log("Error", error);
    });
  }

  deleteInstance(doc: any){
    let SurveillanceInstance = new  Surveillance();

    SurveillanceInstance = doc;
    SurveillanceInstance.deleted = true;
    SurveillanceInstance.modifiedDate = SurveillanceInstance.updateModifiedDate();

    SurveillanceInstance.putInstance((res: any) =>{
      this.communication.showSuccessToast();

      SurveillanceInstance.parseComposite(SurveillanceInstance);

      this.loadComposite();

    }, (err: any) =>{
      console.error('error', err)
      this.communication.showFailedToast();
    });
  }

  submitInstance() {
  }

  parseDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  getValidityStatus(status: boolean): string{
    if(status === true){
      return "Valid";
    }
    return "Invalid";
  }

  formatState(element: any) {
    if (element.type === 'resource') {
      return '-';
    } else {
      // Remove underscores and convert to sentence case
      return element.state.replace(/_/g, ' ').toLowerCase().replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
    }
  }
}
