import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./user-auth-service";

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const authToken = this.authService.getAuthToken();
    const request = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${authToken}`)
    });
    return next.handle(request);
  }
}
