<input type="text" data-role="{{this.name}}" value="foo">
<textarea name="message" id="myMessage" cols="30" rows="10"></textarea>
<button class="btn btn-primary">Click me!</button>
<div class="alert alert-info">
    This is a message. Read me.
</div>
<small class="item {{this.active ? 'active' : ''}} inline" data-id="item-{{this.id}}"></small>