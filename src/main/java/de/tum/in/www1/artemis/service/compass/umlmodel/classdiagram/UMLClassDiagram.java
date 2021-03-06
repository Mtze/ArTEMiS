package de.tum.in.www1.artemis.service.compass.umlmodel.classdiagram;

import java.util.ArrayList;
import java.util.List;

import de.tum.in.www1.artemis.service.compass.umlmodel.Similarity;
import de.tum.in.www1.artemis.service.compass.umlmodel.UMLDiagram;
import de.tum.in.www1.artemis.service.compass.umlmodel.UMLElement;

public class UMLClassDiagram extends UMLDiagram {

    private final List<UMLClass> classList;

    private final List<UMLRelationship> relationshipList;

    private final List<UMLPackage> packageList;

    public UMLClassDiagram(long modelSubmissionId, List<UMLClass> classList, List<UMLRelationship> relationshipList, List<UMLPackage> packageList) {
        super(modelSubmissionId);

        this.classList = classList;
        this.relationshipList = relationshipList;
        this.packageList = packageList;
    }

    @Override
    public UMLElement getElementByJSONID(String jsonElementId) {
        UMLElement element;

        for (UMLClass umlClass : classList) {
            element = umlClass.getElementByJSONID(jsonElementId);
            if (element != null) {
                return element;
            }
        }

        for (UMLRelationship relationship : relationshipList) {
            if (relationship.getJSONElementID().equals(jsonElementId)) {
                return relationship;
            }
        }

        for (UMLPackage umlPackage : packageList) {
            if (umlPackage.getJSONElementID().equals(jsonElementId)) {
                return umlPackage;
            }
        }

        return null;
    }

    @Override
    protected List<Similarity<UMLElement>> getModelElements() {
        List<Similarity<UMLElement>> modelElements = new ArrayList<>();
        modelElements.addAll(classList);
        modelElements.addAll(relationshipList);
        modelElements.addAll(packageList);

        return modelElements;
    }

    /**
     * Get the list of UML classes contained in this class diagram.
     *
     * @return the list of UML classes
     */
    public List<UMLClass> getClassList() {
        return classList;
    }

    /**
     * Get the list of UML relationships contained in this class diagram.
     *
     * @return the list of UML classes
     */
    public List<UMLRelationship> getRelationshipList() {
        return relationshipList;
    }

    /**
     * Get the list of UML packages contained in this class diagram.
     *
     * @return the list of UML classes
     */
    public List<UMLPackage> getPackageList() {
        return packageList;
    }
}
