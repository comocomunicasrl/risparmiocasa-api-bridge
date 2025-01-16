import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserInfo } from "./_models/user-info";
import { environment } from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class FantasanremoService {
    constructor(
        private http: HttpClient
    ) { }

    sendUserInfo(userInfo: UserInfo) {
        return this.http.post(`${environment.apiServerUrl}/api/fantasanremo/userInfo`, userInfo);
    }
}