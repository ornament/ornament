<ul class="nav nav-tabs">
    <li repeat="this.people" data-name="{{this.name}}" class="nav-item">
        <a href="#">
            {{this.name}}
        </a>
    </li>
</ul>
<ul class="list-group">
    <li repeat="this.people" class="list-group-item">{{this.name}}</li>
</ul>