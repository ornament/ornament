{{this.title}}
{{this["messages"].length}}
{{this.messages.length + 1}}
{{this.messages.length + 'msgs'}}
{{this.messages.length + this.privateMessages.length}}
{{this.messages[0].body}}
{{this.fn()}}
{{this.fn(this.myValue)}}
{{this.fn(this.myValue, this.second.value)}}
<input value="{{this.title}}">
<input value="{{this.count + 1}}">