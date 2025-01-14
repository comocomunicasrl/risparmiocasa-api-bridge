import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserInfo } from "./_models/user-info";

@Injectable({ providedIn: 'root' })
export class FantasanremoService {
    constructor(
        private http: HttpClient
    ) { }

    sendUserInfo(userInfo: UserInfo) {
        return this.http.post('/api/fantasanremo/userInfo', userInfo);
    }
}