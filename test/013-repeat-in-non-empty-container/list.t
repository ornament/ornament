<ul>
    <li repeat="this.people">
        {{this.name}}
    </li>
    <li>
        + Add person
    </li>
</ul>
<select>
    <option>Select person...</option>
    <option repeat="this.people" data-person="{{this.name}}">
        {{this.name}}
    </option>
</select>