import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute }  from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss']
})
export class DishDetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'comment': '',
    'author': '',
  };

  validationMessages = {
    'comment': {
      'required': 'A comment is required.',
    },
    'author': {
      'required': 'Author name is required.',
      'minlength': 'Author name must be at least 2 characters long'
    }
  };
    
  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') public BaseURL) { 
      this.createForm();
    }

  ngOnInit(): void {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe((dish) => { 
        this.dish = dish; 
        this.setPrevNext(dish.id);
      },
        errmess => this.errMess = <any>errmess
      );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.commentForm = this.fb.group({
      rating: [5],
      comment: ['', [Validators.required]],
      author: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); 
}

onValueChanged(data?: any) {
  if (!this.commentForm) {
    return;
  }
  const form = this.commentForm;
  for (const field in this.formErrors) {
    if (this.formErrors.hasOwnProperty(field)) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }
}

  onSubmit() {
    this.comment = this.commentForm.value;
    let d = new Date();
    let date = d.toISOString();
    this.comment.date = date;
    console.log(this.comment);
    this.dish.comments.push(this.comment);

    this.commentFormDirective.resetForm();

    this.commentForm.reset({
      rating: 5,
      comment: '',
      author: '',
    });

  }

}
