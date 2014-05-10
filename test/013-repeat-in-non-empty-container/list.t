<ul>
    <li repeat="people">
        {{name}}
    </li>
    <li>
        + Add person
    </li>
</ul>
<select>
    <option>Select person...</option>
    <option repeat="people" data-person="{{name}}">
        {{name}}
    </option>
</select>