import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { Store } from "@ngrx/store";

import { User } from "./user.model";
import { AuthData } from "./auth-data.model";
import { TrainingService } from "../training/training.service";
import { UIService } from "../shared/ui.service";

import * as fromRoot from "../app.reducer";
import * as UI from "../shared/ui.actions";
import * as AuthActions from "./auth.actions";

@Injectable()
export class AuthService {
  private isAuthenticated = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private uiService: UIService,
    private store: Store<fromRoot.State>
  ) {}

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.store.dispatch(new AuthActions.SetAuthenticated());
        this.router.navigate(["/training"]);
      } else {
        this.trainingService.cancelSubscriptions();
        this.store.dispatch(new AuthActions.SetUnauthenticated());
        this.router.navigate(["/login"]);
        this.isAuthenticated = false;
      }
    });
  }

  registerUser(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        console.log(result);
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
        // this.snackbar.open(error.message, null, {
        //   duration: 3000
        // });
      });
  }

  login(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.auth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  logout() {
    this.trainingService.cancelSubscriptions();
    this.afAuth.auth.signOut();
    this.store.dispatch(new AuthActions.SetUnauthenticated());
    this.router.navigate(["/login"]);
    this.isAuthenticated = false;
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
