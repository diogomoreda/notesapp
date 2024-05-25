import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesExplorerComponent } from './notes-explorer.component';

describe('NotesExplorerComponent', () => {
  let component: NotesExplorerComponent;
  let fixture: ComponentFixture<NotesExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesExplorerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotesExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
