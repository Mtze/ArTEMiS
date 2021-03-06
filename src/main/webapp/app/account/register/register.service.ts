import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';
import { User } from 'app/core';

@Injectable({ providedIn: 'root' })
export class Register {
    constructor(private http: HttpClient) {}

    /**
     * Registers a new user. This is only possible if the password is long enough and there is no other user with the
     * same username or e-mail.
     *
     * @param account The data object holding the information about the new user
     */
    save(account: User): Observable<void> {
        return this.http.post<void>(SERVER_API_URL + 'api/register', account);
    }
}
